from rest_framework import serializers

from requests.models import ServiceRequest

from .models import MechanicProfile

<<<<<<< HEAD
VALID_SKILLS = [key for key, _ in ServiceRequest.PROBLEM_TYPE_CHOICES]
VALID_VEHICLE_TYPES = [key for key, _ in ServiceRequest.VEHICLE_TYPE_CHOICES]


class MechanicProfileSerializer(serializers.ModelSerializer):
    # Exposed to the client as a list of category slugs (e.g. ["tyre_puncture", "towing"])
    # even though it's stored on the model as a comma-separated string.
    skills = serializers.ListField(
        child=serializers.ChoiceField(choices=VALID_SKILLS),
        allow_empty=False,
    )

    # Same idea as `skills`, but for vehicle categories (e.g. ["car", "van"]).
    # Optional: a mechanic who leaves this empty is shown requests for every
    # vehicle type (see MechanicProfile.matched_vehicle_types fallback).
    vehicle_types = serializers.ListField(
        child=serializers.ChoiceField(choices=VALID_VEHICLE_TYPES),
        required=False,
    )

=======
class MechanicProfileSerializer(serializers.ModelSerializer): #Serializers to convert MechanicProfile model into JSON & vice versa
>>>>>>> 92ba1d3cdfa6749bba422bab3a3a7ff1ab9a6620
    class Meta:
        # Specify the model associated with the serializer
        model = MechanicProfile
<<<<<<< HEAD
        fields = [
            "id",
            "user",
            "skills",
            "vehicle_types",
            "latitude",
            "longitude",
            "availability",
            "rating",
        ]
        read_only_fields = ["id", "user", "rating"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["skills"] = instance.skill_list()
        data["vehicle_types"] = instance.vehicle_type_list()
        return data

    def _dedupe(self, value):
        seen = []
        for slug in value:
            if slug not in seen:
                seen.append(slug)
        return seen

    def validate_skills(self, value):
        # ChoiceField already rejects unknown slugs; just de-duplicate here.
        return self._dedupe(value)

    def validate_vehicle_types(self, value):
        return self._dedupe(value)

    def create(self, validated_data):
        validated_data["skills"] = ",".join(validated_data.get("skills", []))
        validated_data["vehicle_types"] = ",".join(validated_data.get("vehicle_types", []))
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "skills" in validated_data:
            validated_data["skills"] = ",".join(validated_data["skills"])
        if "vehicle_types" in validated_data:
            validated_data["vehicle_types"] = ",".join(validated_data["vehicle_types"])
        return super().update(instance, validated_data)

    def validate_latitude(self, value):
        if value is None:
=======
        fields = ["id", "user", "skills", "latitude", "longitude", "availability", "rating"] # Fields to be included in the serialized output/input
        read_only_fields = ["id", "user", "rating"] # Fields that cannot be modified by the user (read-only)

    def validate_latitude(self, value): #Custom validation method for latitude
        if value is None: #Allow Null values if latitude is not provided
>>>>>>> 92ba1d3cdfa6749bba422bab3a3a7ff1ab9a6620
            return value
        if not (-90 <= value <= 90):  #Ensure that the latitude is within valid graphical range
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return value

    def validate_longitude(self, value): # Custom validation method for longitude
        if value is None: #Allow null values if longitude is not provided 
            return value
        if not (-180 <= value <= 180): # Ensure that the given longitude is within the valid geographical range
            raise serializers.ValidationError("Longitude must be between -180 and 180.")
        return value
