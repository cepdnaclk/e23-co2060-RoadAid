from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('mechanic', 'Mechanic'),
        
    )

    role = models.CharField(max_length=20, choices= ROLE_CHOICES)

    latitude = models.FloatField(null=True, blank = True)
    longitude = models.FloatField(null=True, blank = True)

    def __str__(self):
        return f"{self.username} ({self.role})"
