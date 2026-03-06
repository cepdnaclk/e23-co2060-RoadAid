from .views import (
    CreateServiceRequestView,
    MyRequestsView,
    PendingRequestsView,
    AcceptRequestView,
    CompleteRequestView,
    CancelRequestView,
    RejectRequestView,
    RateRequestView,
    MyActiveRequestView, 
    MechanicActiveJobView,
)

from django.urls import path


urlpatterns = [
    path("", CreateServiceRequestView.as_view(), name="create-request"),
    path("my/", MyRequestsView.as_view(), name="my-requests"),
    path("pending/", PendingRequestsView.as_view(), name="pending-requests"),
    path("<int:pk>/accept/", AcceptRequestView.as_view(), name="accept-request"),
    path("<int:pk>/complete/", CompleteRequestView.as_view(), name="complete-request"),
    path("<int:pk>/cancel/", CancelRequestView.as_view(), name="cancel-request"),
    path("<int:pk>/reject/", RejectRequestView.as_view(), name="reject-request"),
    path("<int:pk>/rate/", RateRequestView.as_view(), name="rate-request"),
    path("my/active/", MyActiveRequestView.as_view()),
    path("me/active/", MechanicActiveJobView.as_view()),
]