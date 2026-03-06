from rest_framework import serializers
from .models import MechanicProfile

class MechanicProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MechanicProfile
        fields = ["id", "user", "skills", "latitude", "longitude", "availability", "rating"]
        read_only_fields = ["id", "user", "rating"]

    def validate_latitude(self, value):
        if value is None:
            return value
        if not (-90 <= value <= 90):
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return value

    def validate_longitude(self, value):
        if value is None:
            return value
        if not (-180 <= value <= 180):
            raise serializers.ValidationError("Longitude must be between -180 and 180.")
        return value