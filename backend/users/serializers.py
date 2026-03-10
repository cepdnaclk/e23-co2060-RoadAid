from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from mechanics.models import MechanicProfile
from .models import User


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
    skills = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "password", "email", "full_name", "phone", "skills"]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def create(self, validated_data):
        skills = validated_data.pop("skills", "").strip()

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