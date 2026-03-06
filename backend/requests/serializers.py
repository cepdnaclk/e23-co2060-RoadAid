from rest_framework import serializers
from .models import ServiceRequest


class ServiceRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequest
        fields = ["id", "latitude", "longitude", "description", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]


class ServiceRequestSerializer(serializers.ModelSerializer):
    customer_username = serializers.CharField(source="customer.username", read_only=True)
    mechanic_username = serializers.CharField(source="mechanic.username", read_only=True)

    class Meta:
        model = ServiceRequest
        fields = [
            "id",
            "customer",
            "customer_username",
            "mechanic",
            "mechanic_username",
            "latitude",
            "longitude",
            "description",
            "status",
            "created_at",
            "rating",
            "review_comment",
        ]
        read_only_fields = fields