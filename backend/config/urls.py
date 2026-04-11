from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls), # Django built-in admin panel
    path("api/", include("users.urls")), # User related end points (registration, login, profile , etc)
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"), # Accessible ate api/token/refresh
    path("mechanics/", include("mechanics.urls")), # routed to mechanics/urls.py
    path("requests/", include("requests.urls")), # routed to requests/urls.py
]
