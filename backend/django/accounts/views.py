from django.shortcuts import render, get_object_or_404
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.utils import timezone

from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import User, EmailVerification, Follow, UserChallengeCategory
from .serializers import (
    UserListSerializer,
    UserCreateSerializer,
    UserProfileSerializer,
    FollowSerializer,
    UserChallengeCategorySerializer,
)

# 시스템 에러 처리를 위한 import
from api_error.system_exception import (
    Error,
    SystemError,
    SystemErrorList,
    SystemException,
)

# JWT 토큰 관련
from rest_framework_simplejwt.tokens import RefreshToken

import re


class AccountViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return UserListSerializer
        if self.action == "create":
            return UserCreateSerializer
        return UserProfileSerializer

    def get_permissions(self):
        if self.action in ["create", "validate", "login", "verify_email"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter("username", openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter("email", openapi.IN_QUERY, type=openapi.TYPE_STRING),
        ]
    )
    def list(self, request):
        queryset = self.get_queryset()
        email = request.query_params.get("email")
        username = request.query_params.get("username")

        if email:
            queryset = queryset.filter(email__contains=email)
        if username:
            queryset = queryset.filter(username__icontains=username)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def register(self, request):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # 이메일 인증 토큰 생성 및 발송 로직

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"])
    def login(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(request, email=email, password=password)
        if user is None:
            raise SystemException(
                SystemErrorList.errors[Error.INVALID_LOGIN_INFO.value]
            )

        if not user.email_verified:
            raise SystemException(
                SystemErrorList.errors[Error.EMAIL_NOT_VERIFIED.value]
            )

        login(request, user)

        from rest_framework_simplejwt.tokens import RefreshToken

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": UserProfileSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            }
        )

    @action(detail=False, methods=["get"])
    def validate(self, request):
        field = request.query_params.get("field")
        value = request.query_params.get("value")

        if not field or not value:
            raise SystemException(SystemErrorList.errors[Error.INVALID_PARAMETER.value])

        if field == "email":
            exists = User.objects.filter(email=value).exists()
        elif field == "nickname":
            exists = User.objects.filter(nickname=value).exists()
        else:
            raise SystemException(SystemErrorList.errors[Error.INVALID_PARAMETER.value])

        return Response({"exists": exists})

    @action(detail=False, methods=["post"])
    def verify_email(self, request):
        token = request.data.get("token")
        verification = get_object_or_404(EmailVerification, token=token)

        if verification.expires_at < timezone.now():
            raise SystemException(SystemErrorList.errors[Error.TOKEN_EXPIRED.value])

        user = verification.user
        user.email_verified = True
        user.save()

        verification.verified = True
        verification.save()

        return Response({"message": "이메일이 인증되었습니다."})

    @action(detail=False, methods=["get", "put", "delete"])
    def me(self, request):
        if request.method == "GET":
            serializer = UserProfileSerializer(request.user)
            return Response(serializer.data)

        elif request.method == "PUT":
            serializer = UserProfileSerializer(
                request.user, data=request.data, partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        elif request.method == "DELETE":
            request.user.is_active = False
            request.user.save()
            logout(request)
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["post"])
    def logout(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["put"])
    def password(self, request):
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "비밀번호가 변경되었습니다."})

    @action(detail=True, methods=["post", "delete"])
    def follow(self, request, pk=None):
        target_user = self.get_object()

        if target_user == request.user:
            raise SystemException(
                SystemErrorList.errors[Error.CANNOT_FOLLOW_SELF.value]
            )

        if request.method == "POST":
            follow, created = Follow.objects.get_or_create(
                follower=request.user, following=target_user
            )
            if created:
                return Response(
                    {"message": f"{target_user.nickname}님을 팔로우했습니다."}
                )
            return Response(
                {"message": "이미 팔로우하고 있습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        elif request.method == "DELETE":
            follow = Follow.objects.filter(
                follower=request.user, following=target_user
            ).first()
            if follow:
                follow.delete()
                return Response(
                    {"message": f"{target_user.nickname}님을 언팔로우했습니다."}
                )
            return Response(
                {"message": "팔로우하고 있지 않습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    @action(detail=True, methods=["get"])
    def followers(self, request, pk=None):
        user = self.get_object()
        followers = Follow.objects.filter(following=user)
        serializer = FollowSerializer(followers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def following(self, request, pk=None):
        user = self.get_object()
        following = Follow.objects.filter(follower=user)
        serializer = FollowSerializer(following, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get", "post"])
    def categories(self, request):
        if request.method == "GET":
            try:
                category = UserChallengeCategory.objects.get(user=request.user)
                serializer = UserChallengeCategorySerializer(category)
                return Response(serializer.data)
            except UserChallengeCategory.DoesNotExist:
                return Response(
                    {
                        "cafe": False,
                        "restaurant": False,
                        "grocery": False,
                        "shopping": False,
                        "culture": False,
                        "hobby": False,
                        "drink": False,
                        "transportation": False,
                        "etc": False,
                    }
                )

        elif request.method == "POST":
            serializer = UserChallengeCategorySerializer(
                data=request.data, context={"request": request}
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def recommendations(self, request):
        # 팔로우 추천 로직 구현
        # 예: 같은 챌린지에 참여한 사용자, 공통 관심사를 가진 사용자 등
        user = request.user
        already_following = Follow.objects.filter(follower=user).values_list(
            "following_id", flat=True
        )
        recommendations = User.objects.exclude(id__in=already_following).exclude(
            id=user.id
        )[:5]
        serializer = UserProfileSerializer(
            recommendations, many=True, context={"request": request}
        )
        return Response(serializer.data)
