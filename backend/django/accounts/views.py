from django.contrib.auth import authenticate, login, logout
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Follow, UserChallengeCategory
from .serializers import (
    UserListSerializer,
    UserCreateSerializer,
    UserProfileSerializer,
    FollowSerializer,
    UserChallengeCategorySerializer,
)


class AccountViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()

    def get_serializer_class(self):
        if self.action == "list":
            return UserListSerializer
        elif self.action == "create":
            return UserCreateSerializer
        return UserProfileSerializer

    def get_permissions(self):
        if self.action in ["create", "register", "login"]:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=["post"])
    def register(self, request):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"])
    def login(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(request, email=email, password=password)
        if user is None:
            return Response(
                {"error": "이메일 또는 비밀번호가 올바르지 않습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        login(request, user)
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserProfileSerializer(user, context={"request": request}).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            }
        )

    @action(detail=False, methods=["post"])
    def logout(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get", "put", "delete"])
    def me(self, request):
        if request.method == "GET":
            serializer = UserProfileSerializer(
                request.user, context={"request": request}
            )
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

    @action(detail=True, methods=["post", "delete"])
    def follow(self, request, pk=None):
        target_user = self.get_object()
        if target_user == request.user:
            return Response(
                {"error": "자기 자신을 팔로우할 수 없습니다."},
                status=status.HTTP_400_BAD_REQUEST,
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
            serializer = UserChallengeCategorySerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(user=request.user)
            return Response(serializer.data)
