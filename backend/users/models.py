from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ("customer", "Customer"),
        ("mechanic", "Mechanic"),
    )

    APPROVAL_CHOICES = (
        ("approved", "Approved"),
        ("pending", "Pending"),
        ("rejected", "Rejected"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    full_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    approval_status = models.CharField(
        max_length=20,
        choices=APPROVAL_CHOICES,
        default="approved",
    )
    # Stable Google account identifier (the token's `sub` claim). Email addresses
    # can change, so they must not be used as the external-account identifier.
    google_subject = models.CharField(max_length=255, unique=True, null=True, blank=True)

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
