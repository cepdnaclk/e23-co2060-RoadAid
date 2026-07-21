from django.contrib import admin
from .models import MechanicProfile


@admin.register(MechanicProfile)  # Register the MechanicProfile model with the Django admin panel
@admin.register(MechanicProfile)
class MechanicProfileAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "skills_readable",
        "vehicle_types_readable",
        "availability",
        "rating",
        "latitude",
        "longitude",
    )
    list_filter = ("availability",)
    search_fields = ("user__username", "user__full_name", "skills", "vehicle_types")
    ordering = ("-id",)

    def skills_readable(self, obj):
        return ", ".join(obj.skill_list()) or "-"
    skills_readable.short_description = "Skills"

    def vehicle_types_readable(self, obj):
        return ", ".join(obj.vehicle_type_list()) or "-"
    vehicle_types_readable.short_description = "Vehicle Types"
