from django.contrib import admin
from django.urls import path, include

from rest_framework_simplejwt.views import TokenRefreshView

from django.conf import settings  
from django.conf.urls.static import static


urlpatterns = [
<<<<<<< HEAD
    path("admin/", admin.site.urls),
    path("api/", include("users.urls")),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("mechanics/", include("mechanics.urls")),
    path("requests/", include("requests.urls")),
    path("admin-api/", include("adminpanel.urls")),
]
=======
    path("admin/", admin.site.urls), # Django built-in admin panel
    path("api/", include("users.urls")), # User related end points (registration, login, profile , etc)
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"), # Accessible ate api/token/refresh
    path("mechanics/", include("mechanics.urls")), # routed to mechanics/urls.py
    path("requests/", include("requests.urls")), #routed to requests/urls.py
]
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
>>>>>>> 92ba1d3cdfa6749bba422bab3a3a7ff1ab9a6620
