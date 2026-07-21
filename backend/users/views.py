from django.conf import settings
from django.db import transaction
from google.auth.transport import urllib3 as google_urllib3
from google.oauth2 import id_token
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import (
    CustomerRegisterSerializer,
    MechanicRegisterSerializer,
    MeSerializer,
    RoadAidTokenObtainPairSerializer,
    build_auth_response,
)


class CustomerRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = CustomerRegisterSerializer
    permission_classes = [permissions.AllowAny]


class MechanicRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = MechanicRegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    serializer_class = RoadAidTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


def _username_for_google_user(email):
    """Create a valid, unique Django username from a Google email address."""
    base = email.split("@", 1)[0]
    base = "".join(char for char in base if char.isalnum() or char in "@.+-_")
    base = base[:140] or "google-user"
    username = base
    suffix = 1
    while User.objects.filter(username=username).exists():
        suffix += 1
        username = f"{base[:150 - len(str(suffix)) - 1]}-{suffix}"
    return username


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def google_login(request):
    """Verify a Google ID token and exchange it for RoadAid JWTs."""
    credential = request.data.get("credential")
    if not credential or not isinstance(credential, str):
        raise ValidationError({"credential": "Google credential is required."})
    if not settings.GOOGLE_OAUTH2_CLIENT_ID:
        raise ValidationError({"detail": "Google Sign-In is not configured on the server."})

    try:
        google_user = id_token.verify_oauth2_token(
            credential,
            google_urllib3.Request(),
            settings.GOOGLE_OAUTH2_CLIENT_ID,
        )
    except ValueError as exc:
        raise ValidationError({"credential": "Invalid or expired Google credential."}) from exc

    email = google_user.get("email", "").strip().lower()
    subject = google_user.get("sub", "").strip()
    if not subject or not email or google_user.get("email_verified") is not True:
        raise ValidationError({"credential": "Google did not provide a verified email address."})

    with transaction.atomic():
        user = User.objects.filter(google_subject=subject).first()
        if user is None:
            # Link a pre-existing local account only when its verified email matches.
            user = User.objects.filter(email__iexact=email).order_by("id").first()
            if user:
                user.google_subject = subject
                user.save(update_fields=["google_subject"])
            else:
                user = User(
                    username=_username_for_google_user(email),
                    email=email,
                    full_name=google_user.get("name", "")[:150],
                    role="customer",
                    approval_status="approved",
                    google_subject=subject,
                )
                user.set_unusable_password()
                user.save()

    if user.role == "mechanic" and user.approval_status != "approved":
        return Response(
            {"detail": "Your mechanic account is pending approval."},
            status=status.HTTP_403_FORBIDDEN,
        )

    return Response(build_auth_response(user))


class MeView(generics.RetrieveAPIView):
    serializer_class = MeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def test_protected(request):
    return Response({
        "message": "You are authenticated",
        "user": request.user.username,
        "role": request.user.role,
    })
