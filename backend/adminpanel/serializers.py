from rest_framework import serializers

from mechanics.models import MechanicProfile
from requests.models import ServiceRequest
from users.models import User


class AdminMechanicProfileSerializer(serializers.ModelSerializer):
    skills = serializers.SerializerMethodField()
    vehicle_types = serializers.SerializerMethodField()

    class Meta:
        model = MechanicProfile
        fields = ["skills", "vehicle_types", "availability", "rating", "latitude", "longitude"]

    def get_skills(self, obj):
        return obj.skill_list()

    def get_vehicle_types(self, obj):
        return obj.vehicle_type_list()


class AdminUserSerializer(serializers.ModelSerializer):
    mechanic_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "full_name",
            "phone",
            "role",
            "approval_status",
            "is_active",
            "is_staff",
            "is_superuser",
            "date_joined",
            "mechanic_profile",
        ]

    def get_mechanic_profile(self, obj):
        profile = getattr(obj, "mechanic_profile", None)
        if not profile:
            return None
        return AdminMechanicProfileSerializer(profile).data


class AdminServiceRequestSerializer(serializers.ModelSerializer):
    customer_username = serializers.CharField(source="customer.username", read_only=True)
    mechanic_username = serializers.CharField(
        source="mechanic.username", read_only=True, default=None
    )
    problem_type_display = serializers.CharField(
        source="get_problem_type_display", read_only=True
    )
    vehicle_type_display = serializers.CharField(
        source="get_vehicle_type_display", read_only=True
    )

    class Meta:
        model = ServiceRequest
        fields = [
            "id",
            "customer_username",
            "mechanic_username",
            "problem_type",
            "problem_type_display",
            "custom_problem",
            "vehicle_type",
            "vehicle_type_display",
            "description",
            "status",
            "latitude",
            "longitude",
            "created_at",
            "rating",
            "review_comment",
        ]