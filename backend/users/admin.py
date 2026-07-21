from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.action(description="Approve selected mechanics")
def approve_mechanics(modeladmin, request, queryset):
    updated = queryset.filter(role="mechanic").update(approval_status="approved")
    modeladmin.message_user(request, f"Approved {updated} mechanic account(s).")


@admin.action(description="Reject selected mechanics")
def reject_mechanics(modeladmin, request, queryset):
    updated = queryset.filter(role="mechanic").update(approval_status="rejected")
    modeladmin.message_user(request, f"Rejected {updated} mechanic account(s).")


@admin.action(description="Suspend selected users")
def suspend_users(modeladmin, request, queryset):
    updated = queryset.exclude(id=request.user.id).update(is_active=False)
    modeladmin.message_user(request, f"Suspended {updated} account(s).")


@admin.action(description="Reactivate selected users")
def reactivate_users(modeladmin, request, queryset):
    updated = queryset.update(is_active=True)
    modeladmin.message_user(request, f"Reactivated {updated} account(s).")


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
        "is_active",
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
    actions = [approve_mechanics, reject_mechanics, suspend_users, reactivate_users]

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