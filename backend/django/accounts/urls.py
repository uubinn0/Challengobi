from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

urlpatterns = [
    # 회원가입/회원가입완료/로그인/로그아웃/회원탈퇴
    path(
        "register/",
        views.UserRegistrationView.as_view(),
        name="account-register",
    ),
    path(
        'register/complete/', 
        views.UserRegistrationCompleteView.as_view(), 
        name='register-complete'
        ),
    path(
        "login/",
        views.UserLoginView.as_view(),
        name="account-login",
    ),
    path(
        "logout/",
        views.LogoutView.as_view(),
        name="account-logout",
    ),
    path('me/delete/', 
         views.UserDeleteView.as_view(), 
         name='user-delete'
         ),
    path('me/', 
         views.UserProfileView.as_view(), 
         name='profile'
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
