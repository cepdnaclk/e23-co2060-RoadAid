from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import MechanicProfile
from .serializers import MechanicProfileSerializer
from requests.models import ServiceRequest


class MechanicProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = MechanicProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user

        if getattr(user, "role", None) != "mechanic":
            raise PermissionDenied("Only mechanics can access mechanic profile.")

        profile, _ = MechanicProfile.objects.get_or_create(user=user)
        return profile


class UpdateMyLocationView(APIView):
    """
    POST /mechanics/location/
    Mechanic updates own live location (polling method).
    Body: {"latitude": 7.25, "longitude": 80.59}
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if getattr(user, "role", None) != "mechanic":
            raise PermissionDenied("Only mechanics can update location.")

        mp = MechanicProfile.objects.filter(user=user).first()
        if not mp:
            raise NotFound("Mechanic profile not found.")

        try:
            lat = float(request.data.get("latitude"))
            lng = float(request.data.get("longitude"))
        except (TypeError, ValueError):
            return Response({"detail": "latitude and longitude must be numbers."}, status=400)

        mp.latitude = lat
        mp.longitude = lng
        mp.save(update_fields=["latitude", "longitude", "updated_at"])

        return Response(
            {"mechanic_id": user.id, "latitude": mp.latitude, "longitude": mp.longitude, "updated_at": mp.updated_at},
            status=status.HTTP_200_OK
        )


class GetMechanicLocationView(APIView):
    """
    GET /mechanics/<mechanic_id>/location/
    Customer reads mechanic location ONLY if customer has an accepted request with that mechanic.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, mechanic_id):
        user = request.user
        if getattr(user, "role", None) != "customer":
            raise PermissionDenied("Only customers can view mechanic location.")

        allowed = ServiceRequest.objects.filter(
            customer=user,
            mechanic_id=mechanic_id,
            status="accepted"
        ).exists()

        if not allowed:
            return Response({"detail": "No accepted request with this mechanic."}, status=403)

        mp = MechanicProfile.objects.filter(user_id=mechanic_id).first()
        if not mp:
            raise NotFound("Mechanic profile not found.")

        if mp.latitude is None or mp.longitude is None:
            return Response({"detail": "Mechanic location not available yet."}, status=404)

        return Response(
            {"mechanic_id": mechanic_id, "latitude": mp.latitude, "longitude": mp.longitude, "updated_at": mp.updated_at},
            status=status.HTTP_200_OK
        )