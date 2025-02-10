from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("", views.AccountViewSet, basename="account")

urlpatterns = [
    # 회원가입/인증
    path("register/", views.AccountViewSet.as_view({"post": "register"})),
    path("register/social/", views.AccountViewSet.as_view({"post": "register_social"})),
    path(
        "register/complete/",
        views.AccountViewSet.as_view({"post": "complete_registration"}),
    ),
    # 이메일/닉네임 중복 검사
    path(
        "email/verify/",
        views.AccountViewSet.as_view({"post": "send_verification_email"}),
    ),
    path(
        "email/verify/<str:token>/",
        views.AccountViewSet.as_view({"post": "verify_email"}),
    ),
    path("validate/", views.AccountViewSet.as_view({"get": "validate"})),
    # 로그인/로그아웃
    path("login/", views.AccountViewSet.as_view({"post": "login"})),
    path("logout/", views.AccountViewSet.as_view({"post": "logout"})),
    path("password/", views.AccountViewSet.as_view({"put": "change_password"})),
    # 프로필 관리
    path(
        "me/",
        views.AccountViewSet.as_view(
            {"get": "me", "put": "update_me", "delete": "delete_me"}
        ),
    ),
    # 내 게시글 조회
    path("me/posts/", views.AccountViewSet.as_view({"get": "my_posts"})),
    # 팔로우 관리
    path(
        "<int:user_id>/follow/",
        views.FollowViewSet.as_view({"post": "follow", "delete": "unfollow"}),
    ),
    path("<int:user_id>/followers/", views.FollowViewSet.as_view({"get": "followers"})),
    path("<int:user_id>/following/", views.FollowViewSet.as_view({"get": "following"})),
    # 사용자 검색/추천
    path("search/", views.AccountViewSet.as_view({"get": "search"})),
    path("recommendations/", views.AccountViewSet.as_view({"get": "recommendations"})),
    path("", include(router.urls)),
]
