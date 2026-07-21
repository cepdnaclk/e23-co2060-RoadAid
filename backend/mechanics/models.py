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
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mechanic_profile')

    # Stored as a comma-separated list of ServiceRequest.PROBLEM_TYPE_CHOICES keys
    skills = models.TextField()

    # Stored as a comma-separated list of ServiceRequest.VEHICLE_TYPE_CHOICES keys
    vehicle_types = models.TextField(blank=True, default="")

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    availability = models.BooleanField(default=True)
    rating = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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