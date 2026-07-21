from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from requests.models import ServiceRequest
from users.models import User

from .serializers import AdminServiceRequestSerializer, AdminUserSerializer


class IsStaffUser(permissions.BasePermission):
    """Staff (admin panel access) - either superuser or is_staff=True."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class IsSuperUser(permissions.BasePermission):
    """Full owner-level access - required for destructive actions like delete."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)


# ---------------------------------------------------------------------------
# Dashboard stats
# ---------------------------------------------------------------------------

class AdminStatsView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        today = timezone.now().date()

        return Response({
            "pending_mechanics": User.objects.filter(
                role="mechanic", approval_status="pending"
            ).count(),
            "approved_mechanics": User.objects.filter(
                role="mechanic", approval_status="approved"
            ).count(),
            "total_customers": User.objects.filter(role="customer").count(),
            "active_requests": ServiceRequest.objects.filter(
                status__in=["pending", "accepted"]
            ).count(),
            "requests_today": ServiceRequest.objects.filter(
                created_at__date=today
            ).count(),
            "suspended_users": User.objects.filter(is_active=False).count(),
        })


# ---------------------------------------------------------------------------
# User management
# ---------------------------------------------------------------------------

class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [IsStaffUser]

    def get_queryset(self):
        qs = User.objects.select_related("mechanic_profile").order_by("-date_joined")

        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role=role)

        approval_status = self.request.query_params.get("approval_status")
        if approval_status:
            qs = qs.filter(approval_status=approval_status)

        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() in ("1", "true", "yes"))

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                username__icontains=search
            ) | qs.filter(full_name__icontains=search) | qs.filter(email__icontains=search)

        return qs


class AdminUserDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = AdminUserSerializer
    queryset = User.objects.select_related("mechanic_profile").all()
    permission_classes = [IsStaffUser]

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsSuperUser()]
        return super().get_permissions()

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()

        if user.role == "customer":
            raise ValidationError(
                "Customer accounts can't be deleted - it would permanently erase their "
                "entire request history (including jobs mechanics completed for them). "
                "Suspend the account instead."
            )

        if user == request.user:
            raise ValidationError("You can't delete your own account.")

        return super().destroy(request, *args, **kwargs)


def _get_target_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise ValidationError("User not found.")


class AdminApproveMechanicView(APIView):
    permission_classes = [IsStaffUser]

    def post(self, request, user_id):
        user = _get_target_user(user_id)
        if user.role != "mechanic":
            raise ValidationError("Only mechanic accounts can be approved.")

        user.approval_status = "approved"
        user.save(update_fields=["approval_status"])
        return Response(AdminUserSerializer(user).data)


class AdminRejectMechanicView(APIView):
    permission_classes = [IsStaffUser]

    def post(self, request, user_id):
        user = _get_target_user(user_id)
        if user.role != "mechanic":
            raise ValidationError("Only mechanic accounts can be rejected.")

        user.approval_status = "rejected"
        user.save(update_fields=["approval_status"])
        return Response(AdminUserSerializer(user).data)


class AdminSuspendUserView(APIView):
    permission_classes = [IsStaffUser]

    def post(self, request, user_id):
        user = _get_target_user(user_id)

        if user == request.user:
            raise ValidationError("You can't suspend your own account.")
        if user.is_superuser and not request.user.is_superuser:
            raise PermissionDenied("Only a superuser can suspend a superuser account.")

        user.is_active = False
        user.save(update_fields=["is_active"])
        return Response(AdminUserSerializer(user).data)


class AdminReactivateUserView(APIView):
    permission_classes = [IsStaffUser]

    def post(self, request, user_id):
        user = _get_target_user(user_id)
        user.is_active = True
        user.save(update_fields=["is_active"])
        return Response(AdminUserSerializer(user).data)


# ---------------------------------------------------------------------------
# Service request oversight
# ---------------------------------------------------------------------------

class AdminRequestListView(generics.ListAPIView):
    serializer_class = AdminServiceRequestSerializer
    permission_classes = [IsStaffUser]

    def get_queryset(self):
        qs = ServiceRequest.objects.select_related("customer", "mechanic").order_by(
            "-created_at"
        )

        req_status = self.request.query_params.get("status")
        if req_status:
            qs = qs.filter(status=req_status)

        problem_type = self.request.query_params.get("problem_type")
        if problem_type:
            qs = qs.filter(problem_type=problem_type)

        vehicle_type = self.request.query_params.get("vehicle_type")
        if vehicle_type:
            qs = qs.filter(vehicle_type=vehicle_type)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(customer__username__icontains=search) | qs.filter(
                mechanic__username__icontains=search
            )

        return qs


class AdminForceCancelRequestView(APIView):
    permission_classes = [IsStaffUser]

    def post(self, request, request_id):
        try:
            sr = ServiceRequest.objects.get(id=request_id)
        except ServiceRequest.DoesNotExist:
            raise ValidationError("Request not found.")

        if sr.status in ("completed", "cancelled", "rejected"):
            raise ValidationError(f"Request is already {sr.status}.")

        sr.status = "cancelled"
        sr.save(update_fields=["status"])
        return Response(AdminServiceRequestSerializer(sr).data)