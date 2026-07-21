from django.contrib import admin
from .models import ServiceRequest


@admin.action(description="Force-cancel selected requests")
def force_cancel(modeladmin, request, queryset):
    updated = queryset.exclude(status__in=["completed", "cancelled", "rejected"]).update(
        status="cancelled"
    )
    modeladmin.message_user(request, f"Cancelled {updated} request(s).")


@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer",
        "mechanic",
        "problem_type",
        "vehicle_type",
        "status",
        "created_at",
    )
    list_filter = ("status", "problem_type", "vehicle_type")
    search_fields = ("customer__username", "mechanic__username", "description")
    ordering = ("-created_at",)
    actions = [force_cancel]