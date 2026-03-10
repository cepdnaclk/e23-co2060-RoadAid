from django.urls import path
from .views import (
    AcceptRequestView,
    CancelRequestView,
    CompleteRequestView,
    CreateServiceRequestView,
    MechanicActiveJobView,
    MechanicRequestHistoryView,
    MyActiveRequestView,
    MyRequestHistoryView,
    MyRequestsView,
    MyTrackingInfoView,
    PendingRequestsView,
    RateRequestView,
    RejectRequestView,
)

urlpatterns = [
    path("", CreateServiceRequestView.as_view(), name="create-request"),
    path("pending/", PendingRequestsView.as_view(), name="pending-requests"),

    path("my/", MyRequestsView.as_view(), name="my-requests"),
    path("my/active/", MyActiveRequestView.as_view(), name="my-active-requests"),
    path("my/history/", MyRequestHistoryView.as_view(), name="my-request-history"),
    path("my/tracking/", MyTrackingInfoView.as_view(), name="my-tracking-info"),

    path("me/active/", MechanicActiveJobView.as_view(), name="mechanic-active-job"),
    path("me/history/", MechanicRequestHistoryView.as_view(), name="mechanic-history"),

    path("<int:pk>/accept/", AcceptRequestView.as_view(), name="accept-request"),
    path("<int:pk>/complete/", CompleteRequestView.as_view(), name="complete-request"),
    path("<int:pk>/cancel/", CancelRequestView.as_view(), name="cancel-request"),
    path("<int:pk>/reject/", RejectRequestView.as_view(), name="reject-request"),
    path("<int:pk>/rate/", RateRequestView.as_view(), name="rate-request"),
]