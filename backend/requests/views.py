import math

from django.db import transaction
from django.db.models import Avg
from rest_framework import generics, permissions, status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from mechanics.models import MechanicProfile

from .models import ServiceRequest
from .serializers import ServiceRequestCreateSerializer, ServiceRequestSerializer


def require_role(user, role):
    if getattr(user, "role", None) != role:
        raise PermissionDenied(f"Only {role}s can access this endpoint.")
    

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c


# 1) Customer creates a service request
class CreateServiceRequestView(generics.CreateAPIView):
    serializer_class = ServiceRequestCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        require_role(self.request.user, "customer")

        existing_active = ServiceRequest.objects.filter(
            customer=self.request.user,
            status__in=["pending", "accepted"]
        ).exists()

        if existing_active:
            raise ValidationError({"detail": "You already have an active request."})

        serializer.save(customer=self.request.user)


# 2) Customer views own requests
class MyRequestsView(generics.ListAPIView):
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        require_role(self.request.user, "customer")
        return ServiceRequest.objects.filter(customer=self.request.user).order_by("-created_at")



# 3) Mechanic views pending requests
class PendingRequestsView(generics.ListAPIView):
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        require_role(self.request.user, "mechanic")

        pending = ServiceRequest.objects.filter(status="pending").order_by("-created_at")

        profile = MechanicProfile.objects.filter(user=self.request.user).first()
        if not profile or profile.latitude is None or profile.longitude is None:
            return pending

        radius_km = float(self.request.query_params.get("radius", 50))

        nearby_ids = []
        for r in pending:
            d = haversine_km(profile.latitude, profile.longitude, r.latitude, r.longitude)
            if d <= radius_km:
                nearby_ids.append(r.id)

        return ServiceRequest.objects.filter(id__in=nearby_ids).order_by("-created_at")

# 4) Mechanic accepts a request
class AcceptRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        require_role(request.user, "mechanic")

        try:
            # Lock the row so only one mechanic can accept at a time
            sr = ServiceRequest.objects.select_for_update().get(pk=pk)
        except ServiceRequest.DoesNotExist:
            raise NotFound("Request not found")

        # If already accepted/processed, block it
        if sr.status != "pending" or sr.mechanic is not None:
            return Response({"detail": "Request already accepted or not pending."}, status=400)

        sr.mechanic = request.user
        sr.status = "accepted"
        sr.save(update_fields=["mechanic", "status"])

        return Response(ServiceRequestSerializer(sr).data, status=200)


# 5) Mechanic completes a request
class CompleteRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        require_role(request.user, "mechanic")

        try:
            sr = ServiceRequest.objects.get(pk=pk)
        except ServiceRequest.DoesNotExist:
            raise NotFound("Request not found")

        if sr.status != "accepted":
            return Response({"detail": "Only accepted requests can be completed."}, status=400)

        if sr.mechanic_id != request.user.id:
            return Response({"detail": "You can only complete requests you accepted."}, status=403)

        sr.status = "completed"
        sr.save()

        return Response(ServiceRequestSerializer(sr).data, status=200)
    
# 6) Customer cancels a request
class CancelRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        require_role(request.user, "customer")

        try:
            sr = ServiceRequest.objects.get(pk=pk)
        except ServiceRequest.DoesNotExist:
            raise NotFound("Request not found")

        if sr.customer_id != request.user.id:
            return Response({"detail": "You can only cancel your own request."}, status=403)

        if sr.status != "pending":
            return Response({"detail": "Only pending requests can be cancelled."}, status=400)

        sr.status = "cancelled"
        sr.save(update_fields=["status"])

        return Response(ServiceRequestSerializer(sr).data, status=200)


# 7) Mechanic rejects a request
class RejectRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        require_role(request.user, "mechanic")

        try:
            sr = ServiceRequest.objects.get(pk=pk)
        except ServiceRequest.DoesNotExist:
            raise NotFound("Request not found")

        if sr.status != "pending":
            return Response({"detail": "Only pending requests can be rejected."}, status=400)

        sr.status = "rejected"
        sr.save(update_fields=["status"])

        return Response(ServiceRequestSerializer(sr).data, status=200)
 
 
# 8) Rate a request
class RateRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        require_role(request.user, "customer")

        try:
            sr = ServiceRequest.objects.get(pk=pk)
        except ServiceRequest.DoesNotExist:
            raise NotFound("Request not found")

        if sr.customer_id != request.user.id:
            return Response({"detail": "You can only rate your own request."}, status=403)

        if sr.status != "completed":
            return Response({"detail": "Only completed requests can be rated."}, status=400)

        if sr.mechanic is None:
            return Response({"detail": "No mechanic assigned."}, status=400)

        if sr.rating is not None:
            return Response({"detail": "You have already rated this request."}, status=400)

        # rating (0–5) + optional comment
        try:
            rating = int(request.data.get("rating"))
        except Exception:
            return Response({"detail": "Rating must be an integer."}, status=400)

        comment = (request.data.get("comment") or "").strip()

        if rating < 1 or rating > 5:
            return Response({"detail": "Rating must be between 1 and 5."}, status=400)

        sr.rating = rating
        sr.review_comment = comment
        sr.save(update_fields=["rating", "review_comment"])

        avg = (
            ServiceRequest.objects
            .filter(mechanic=sr.mechanic, rating__isnull=False)
            .aggregate(Avg("rating"))["rating__avg"]
        ) or 0

        mp = MechanicProfile.objects.filter(user=sr.mechanic).first()
        if mp:
            mp.rating = round(float(avg), 2)
            mp.save(update_fields=["rating"])

        return Response(ServiceRequestSerializer(sr).data, status=200)
    
# 9) view active requests
class MyActiveRequestView(APIView):
    """
    GET /requests/my/active/
    Customer gets their latest active request (pending or accepted).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        require_role(request.user, "customer")

        sr = (
            ServiceRequest.objects
            .filter(customer=request.user, status__in=["pending", "accepted"])
            .order_by("-created_at")
            .first()
        )

        if not sr:
            return Response(None, status=200)

        return Response(ServiceRequestSerializer(sr).data, status=200)
    
    
# 10) view active mechanic job
class MechanicActiveJobView(APIView):
    """
    GET /requests/me/active/
    Mechanic gets their latest active job (accepted).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        require_role(request.user, "mechanic")

        sr = (
            ServiceRequest.objects
            .filter(mechanic=request.user, status="accepted")
            .order_by("-created_at")
            .first()
        )

        if not sr:
            return Response(None, status=200)

        return Response(ServiceRequestSerializer(sr).data, status=200)


# 11) View request history
class MyRequestHistoryView(APIView):
    """
    GET /requests/my/history/
    Customer gets completed / cancelled / rejected requests.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        require_role(request.user, "customer")

        qs = (
            ServiceRequest.objects
            .filter(
                customer=request.user,
                status__in=["completed", "cancelled", "rejected"]
            )
            .order_by("-created_at")
        )

        return Response(ServiceRequestSerializer(qs, many=True).data, status=200)
    
 # 12) Mechanic view history
class MechanicRequestHistoryView(APIView):
    """
    GET /requests/me/history/
    Mechanic gets completed / cancelled / rejected jobs.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        require_role(request.user, "mechanic")

        qs = (
            ServiceRequest.objects
            .filter(
                mechanic=request.user,
                status__in=["completed", "cancelled", "rejected"]
            )
            .order_by("-created_at")
        )

        return Response(ServiceRequestSerializer(qs, many=True).data, status=200)


# 13) Tracking view for distance 
class MyTrackingInfoView(APIView):
    """
    GET /requests/my/tracking/
    Customer gets current mechanic distance + rough ETA for accepted request.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        require_role(request.user, "customer")

        sr = (
            ServiceRequest.objects
            .filter(customer=request.user, status="accepted", mechanic__isnull=False)
            .order_by("-created_at")
            .first()
        )

        if not sr:
            return Response(None, status=200)

        profile = MechanicProfile.objects.filter(user=sr.mechanic).first()
        if not profile or profile.latitude is None or profile.longitude is None:
            return Response(None, status=200)

        distance_km = haversine_km(
            sr.latitude,
            sr.longitude,
            profile.latitude,
            profile.longitude,
        )

        avg_speed_kmph = 30.0
        eta_minutes = max(1, round((distance_km / avg_speed_kmph) * 60))

        return Response({
            "request_id": sr.id,
            "customer_latitude": sr.latitude,
            "customer_longitude": sr.longitude,
            "mechanic_latitude": profile.latitude,
            "mechanic_longitude": profile.longitude,
            "distance_km": round(distance_km, 2),
            "eta_minutes": eta_minutes,
        }, status=200)        


