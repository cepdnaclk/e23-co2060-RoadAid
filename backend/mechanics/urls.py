from django.urls import path
from .views import MechanicProfileView, UpdateMyLocationView, GetMechanicLocationView

urlpatterns = [
    path("profile/", MechanicProfileView.as_view()),
    path("location/", UpdateMyLocationView.as_view()),                  # POST
    path("<int:mechanic_id>/location/", GetMechanicLocationView.as_view())  # GET
]