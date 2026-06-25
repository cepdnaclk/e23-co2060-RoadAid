from rest_framework import serializers
from .models import MechanicProfile

class MechanicProfileSerializer(serializers.ModelSerializer): #Serializers to convert MechanicProfile model into JSON & vice versa
    class Meta:
        # Specify the model associated with the serializer
        model = MechanicProfile
        fields = ["id", "user", "skills", "latitude", "longitude", "availability", "rating"] # Fields to be included in the serialized output/input
        read_only_fields = ["id", "user", "rating"] # Fields that cannot be modified by the user (read-only)

    def validate_latitude(self, value): #Custom validation method for latitude
        if value is None: #Allow Null values if latitude is not provided
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
