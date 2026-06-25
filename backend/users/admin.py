from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Customizes the Django Admin interface for the User model.
    By inheriting from BaseUserAdmin, we keep Django's standard password hashing 
    and permission management while adding our custom RoadAid fields.
    """
    list_display = (
        "id",
        "username",
        "email",
        "full_name",
        "phone",
        "role",
        "approval_status",
        "is_staff",
        "is_superuser",
    )

    list_filter = (
        "role",
        "approval_status",
        "is_staff",
        "is_superuser",
        "is_active",
    )

    search_fields = ("username", "email", "full_name", "phone")
    ordering = ("-id",)

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "RoadAid Info",
            {
                "fields": (
                    "full_name",
                    "phone",
                    "role",
                    "approval_status",
                    "latitude",
                    "longitude",
                )
            },
        ),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (
            "RoadAid Info",
            {
                "fields": (
                    "full_name",
                    "phone",
                    "role",
                    "approval_status",
                )
            },
        ),
    )