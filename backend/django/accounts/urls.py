from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("", views.AccountViewSet, basename="account")

urlpatterns = [
    # 기본 CRUD
    path(
        "",
        views.AccountViewSet.as_view({"get": "list", "post": "create"}),
        name="account-list",
    ),
    path(
        "<int:pk>/",
        views.AccountViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="account-detail",
    ),
    # 회원가입/로그인/로그아웃
    path(
        "register/",
        views.AccountViewSet.as_view({"post": "register"}),
        name="account-register",
    ),
    path(
        "login/",
        views.AccountViewSet.as_view({"post": "login"}),
        name="account-login",
    ),
    path(
        "logout/",
        views.AccountViewSet.as_view({"post": "logout"}),
        name="account-logout",
    ),
    path(
        "<int:pk>/followers/",
        views.AccountViewSet.as_view({"get": "followers"}),
        name="account-followers",
    ),
    path(
        "<int:pk>/following/",
        views.AccountViewSet.as_view({"get": "following"}),
        name="account-following",
    ),
    path("", include(router.urls)),
]
