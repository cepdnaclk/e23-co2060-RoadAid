from django.contrib import admin
from .models import MechanicProfile


@admin.register(MechanicProfile) #Register the MechanicProfile model with the Django admin panel
class MechanicProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "skills", "rating", "latitude", "longitude") #Fields to be displayed in the admin list view
    search_fields = ("user__username", "user__full_name", "skills") #Fields that can be searched in the admin panel search bar
    ordering = ("-id",) # Default ordering of recording in the admin panel
