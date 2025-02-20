from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("", views.NotificationViewSet, basename="notification")

urlpatterns = [
    # 알림 조회/관리
    path("", views.NotificationViewSet.as_view({"get": "list", "delete": "clear_all"})),
    path(
        "<int:notification_id>/",
        views.NotificationViewSet.as_view({"get": "retrieve", "delete": "destroy"}),
    ),
    path(
        "<int:notification_id>/read/",
        views.NotificationViewSet.as_view({"put": "mark_as_read"}),
    ),
    path("", include(router.urls)),
]
