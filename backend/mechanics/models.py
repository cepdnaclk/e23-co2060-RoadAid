from django.db import models
from users.models import User

class MechanicProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mechanic_profile') # One-to-one link to the User model; deleting the user removes the profile too
    skills =models.TextField() # showcasing the mechanic's skills
    latitude = models.FloatField(null=True, blank=True) #GPS coordinates for locating the mechanic
    longitude = models.FloatField(null=True, blank= True) # This is optional until  mechanic sets their location 
    availability = models.BooleanField(default=True) # whether the mechanic is currently accepting job requests
    rating = models.FloatField(default=0.0) # avarage customer rating
    created_at = models.DateTimeField(auto_now_add=True) # Automatically recorded timestamps
    updated_at = models.DateTimeField(auto_now= True)

    def __str__(self):
        return f"{self.user.username} - Mechanic Profile"


