from django.db import models
from users.models import User


def _parse_comma_list(value):
    """Parsed, de-duplicated list of slugs from a comma-separated string."""
    seen = []
    for part in (value or "").split(","):
        slug = part.strip()
        if slug and slug not in seen:
            seen.append(slug)
    return seen


class MechanicProfile(models.Model):
<<<<<<< HEAD
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mechanic_profile')

    # Stored as a comma-separated list of ServiceRequest.PROBLEM_TYPE_CHOICES keys,
    # e.g. "tyre_puncture,battery_dead,towing". Kept as a TextField (not a new model/
    # migration) so existing data and the DB schema don't need to change.
    skills = models.TextField()

    # Stored as a comma-separated list of ServiceRequest.VEHICLE_TYPE_CHOICES keys,
    # e.g. "car,van". Lets a tuk-tuk mechanic avoid being shown truck jobs, and
    # vice versa - similar to how ride-hailing apps only match a driver's vehicle
    # category to compatible ride requests.
    vehicle_types = models.TextField(blank=True, default="")

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank= True)
    availability = models.BooleanField(default=True)
    rating = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
=======
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mechanic_profile') # One-to-one link to the User model; deleting the user removes the profile too
    skills =models.TextField() # showcasing the mechanic's skills
    latitude = models.FloatField(null=True, blank=True) #GPS coordinates for locating the mechanic
    longitude = models.FloatField(null=True, blank= True) # This is optional until  mechanic sets their location 
    availability = models.BooleanField(default=True) # whether the mechanic is currently accepting job requests
    rating = models.FloatField(default=0.0) # avarage customer rating
    created_at = models.DateTimeField(auto_now_add=True) # Automatically recorded timestamps
>>>>>>> 92ba1d3cdfa6749bba422bab3a3a7ff1ab9a6620
    updated_at = models.DateTimeField(auto_now= True)

    def __str__(self):
        return f"{self.user.username} - Mechanic Profile"

    def skill_list(self):
        return _parse_comma_list(self.skills)

    def vehicle_type_list(self):
        return _parse_comma_list(self.vehicle_types)

    def _matched(self, stored_list, valid_values):
        """Intersection of a stored comma-list with a known-valid set.

        Old/unrecognised stored values (e.g. free text from before this
        feature existed) won't match any valid slug at all - in that case we
        treat the mechanic as having nothing configured yet, so matching
        falls back to showing everything until they update their profile.
        """
        return set(stored_list) & set(valid_values)

    def matched_skills(self, valid_skills):
        return self._matched(self.skill_list(), valid_skills)

    def matched_vehicle_types(self, valid_vehicle_types):
        return self._matched(self.vehicle_type_list(), valid_vehicle_types)