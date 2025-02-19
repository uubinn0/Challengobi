from django.urls import path
from . import views

urlpatterns = [
    # 회원가입/로그인/로그아웃
    path("register/", views.UserRegistrationView.as_view(), name="register"),
    path("login/", views.UserLoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    # 유효성 검사
    path("validate/", views.ValidationView.as_view(), name="validate"),
    # 프로필 관련
    path("me/", views.UserProfileView.as_view(), name="profile"),  # 내 프로필
    path(
        "users/<int:user_id>/", views.UserDetailView.as_view(), name="user-detail"
    ),  # 타인 프로필
    # 팔로우 관련
    path("users/<int:pk>/follow/", views.FollowView.as_view(), name="follow"),
    path(
        "users/<int:pk>/followers/", views.UserFollowersView.as_view(), name="followers"
    ),
    path(
        "users/<int:pk>/following/", views.UserFollowingView.as_view(), name="following"
    ),
    # 챌린지 카테고리
    path(
        "me/categories/",
        views.UserChallengeCategoryView.as_view(),
        name="challenge-categories",
    ),
    # 사용자 추천
    path(
        "recommendations/",
        views.UserRecommendationsView.as_view(),
        name="user-recommendations",
    ),
]
