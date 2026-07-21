from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from mechanics.models import MechanicProfile
from requests.models import ServiceRequest
from .models import User

VALID_SKILLS = [key for key, _ in ServiceRequest.PROBLEM_TYPE_CHOICES]
VALID_VEHICLE_TYPES = [key for key, _ in ServiceRequest.VEHICLE_TYPE_CHOICES]


class MeSerializer(serializers.ModelSerializer):
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
            "latitude",
            "longitude",
            "is_staff",
            "is_superuser",
        ]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "password", "email", "full_name", "phone", "role"]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def create(self, validated_data):
        role = validated_data.get("role", "customer")

        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            email=validated_data.get("email", ""),
            full_name=validated_data.get("full_name", ""),
            phone=validated_data.get("phone", ""),
            role=role,
            approval_status="pending" if role == "mechanic" else "approved",
        )


class CustomerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["username", "password", "email", "full_name", "phone"]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            email=validated_data.get("email", ""),
            full_name=validated_data.get("full_name", ""),
            phone=validated_data.get("phone", ""),
            role="customer",
            approval_status="approved",
        )


class MechanicRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    # List of ServiceRequest problem-type slugs this mechanic can handle,
    # e.g. ["tyre_puncture", "battery_dead", "towing"].
    skills = serializers.ListField(
        child=serializers.ChoiceField(choices=VALID_SKILLS),
        write_only=True,
        allow_empty=False,
    )
    # List of vehicle categories this mechanic services, e.g. ["car", "van"].
    # Like ride-hailing apps matching a driver's vehicle class to a ride
    # request, this keeps (say) a tuk-tuk mechanic from being shown truck jobs.
    vehicle_types = serializers.ListField(
        child=serializers.ChoiceField(choices=VALID_VEHICLE_TYPES),
        write_only=True,
        allow_empty=False,
    )

    class Meta:
        model = User
        fields = ["username", "password", "email", "full_name", "phone", "skills", "vehicle_types"]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def create(self, validated_data):
        skills_list = validated_data.pop("skills", [])
        skills = ",".join(dict.fromkeys(skills_list))  # de-duplicate, keep order

        vehicle_types_list = validated_data.pop("vehicle_types", [])
        vehicle_types = ",".join(dict.fromkeys(vehicle_types_list))

        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            email=validated_data.get("email", ""),
            full_name=validated_data.get("full_name", ""),
            phone=validated_data.get("phone", ""),
            role="mechanic",
            approval_status="pending",
        )

        MechanicProfile.objects.create(
            user=user,
            skills=skills,
            vehicle_types=vehicle_types,
        )
        return user

    def to_representation(self, instance):
        return {
            "id": instance.id,
            "username": instance.username,
            "email": instance.email,
            "full_name": instance.full_name,
            "phone": instance.phone,
            "role": instance.role,
            "approval_status": instance.approval_status,
        }


class RoadAidTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["approval_status"] = user.approval_status
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        if user.role == "mechanic" and user.approval_status != "approved":
            raise serializers.ValidationError(
                {"detail": "Your mechanic account is pending approval."}
            )

        data["user"] = MeSerializer(user).data
        return data


def build_auth_response(user):
    """Return the same JWT payload used by password sign-in."""
    refresh = RoadAidTokenObtainPairSerializer.get_token(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "user": MeSerializer(user).data,
    }
