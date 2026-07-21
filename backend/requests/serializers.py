from rest_framework import serializers
from .models import ServiceRequest


class ServiceRequestCreateSerializer(serializers.ModelSerializer): # Serializer for creating a new service request (customer- facing)
    class Meta:
        model = ServiceRequest
        fields = [
            "id",
            "latitude",
            "longitude",
            "problem_type",
            "custom_problem",
            "vehicle_type",
            "description",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def validate(self, attrs):  # Ensure custom problem is provided when problem type is 'other'
        problem_type = attrs.get("problem_type")
        custom_problem = (attrs.get("custom_problem") or "").strip()

        if problem_type == "other" and not custom_problem:
            raise serializers.ValidationError({
                "custom_problem": "Please enter the custom problem when 'Other' is selected."
            })

        return attrs


class ServiceRequestSerializer(serializers.ModelSerializer): # Serializer for reading full service request details

    # Human readable usernames instead of raw foreign key IDs
    customer_username = serializers.CharField(source="customer.username", read_only=True)
    mechanic_username = serializers.CharField(source="mechanic.username", read_only=True)
    
    # Display lables for choice fields 
    problem_type_display = serializers.CharField(source="get_problem_type_display", read_only=True)
    vehicle_type_display = serializers.CharField(source="get_vehicle_type_display", read_only=True)

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
            "problem_type",
            "problem_type_display",
            "custom_problem",
            "vehicle_type",
            "vehicle_type_display",
            "description",
            "status",
            "created_at",
            "rating",
            "review_comment",
        ]
        read_only_fields = fields  # All fields are read only since this serializer is used only for retrieval
