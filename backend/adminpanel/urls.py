from django.urls import path

from .views import (
    AdminApproveMechanicView,
    AdminForceCancelRequestView,
    AdminReactivateUserView,
    AdminRejectMechanicView,
    AdminRequestListView,
    AdminStatsView,
    AdminSuspendUserView,
    AdminUserDetailView,
    AdminUserListView,
)

urlpatterns = [
    path("stats/", AdminStatsView.as_view(), name="admin-stats"),

    path("users/", AdminUserListView.as_view(), name="admin-user-list"),
    path("users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
    path("users/<int:user_id>/approve/", AdminApproveMechanicView.as_view(), name="admin-user-approve"),
    path("users/<int:user_id>/reject/", AdminRejectMechanicView.as_view(), name="admin-user-reject"),
    path("users/<int:user_id>/suspend/", AdminSuspendUserView.as_view(), name="admin-user-suspend"),
    path("users/<int:user_id>/reactivate/", AdminReactivateUserView.as_view(), name="admin-user-reactivate"),

    path("requests/", AdminRequestListView.as_view(), name="admin-request-list"),
    path(
        "requests/<int:request_id>/force-cancel/",
        AdminForceCancelRequestView.as_view(),
        name="admin-request-force-cancel",
    ),
]