from django.contrib import admin
from .models import MechanicProfile


@admin.register(MechanicProfile)
class MechanicProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "skills", "rating", "latitude", "longitude")
    search_fields = ("user__username", "user__full_name", "skills")
    ordering = ("-id",) 