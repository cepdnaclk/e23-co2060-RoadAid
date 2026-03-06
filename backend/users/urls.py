from django.urls import path
from .views import RegisterView, test_protected
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('test/', test_protected, name='test_protected'),
    
]
