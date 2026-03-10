from django.urls import path
from .views import (
    CustomerRegisterView,
    LoginView,
    MechanicRegisterView,
    MeView,
    test_protected,
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("register/customer/", CustomerRegisterView.as_view(), name="register-customer"),
    path("register/mechanic/", MechanicRegisterView.as_view(), name="register-mechanic"),
    path("me/", MeView.as_view(), name="me"),
    path("test/", test_protected, name="test_protected"),
]