from django.contrib.auth import authenticate, logout
from rest_framework import status, generics, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, logout
from rest_framework import status, generics, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User, Follow, UserChallengeCategory
from .serializers import (
    UserCreateSerializer,
    NicknameCheckSerializer,
    EmailCheckSerializer,
    UserDeleteSerializer,
    ProfileImageUpdateSerializer,
    UserProfileUpdateSerializer,
    UserProfileSerializer,
    UserLoginSerializer,
    FollowSerializer,
    UserChallengeCategorySerializer,
)
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings
import requests


class EmailCheckView(views.APIView):
    """이메일 중복 검사"""

    def post(self, request):
        serializer = EmailCheckSerializer(data=request.data)
        if serializer.is_valid():
            return Response(
                {"message": "사용 가능한 이메일입니다."}, status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NicknameCheckView(views.APIView):
    """닉네임 중복 검사"""

    def post(self, request):
        serializer = NicknameCheckSerializer(data=request.data)
        if serializer.is_valid():
            return Response(
                {"message": "사용 가능한 닉네임입니다."}, status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name="dispatch")
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserCreateSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.perform_create(serializer)

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "회원가입이 완료되었습니다.",
                "data": serializer.data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )


@method_decorator(csrf_exempt, name="dispatch")
class UserLoginView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "message": "로그인 성공",
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                "user": UserProfileSerializer(user, context={"request": request}).data,
            },
            status=status.HTTP_201_CREATED,
        )

    def perform_create(self, serializer):
        return serializer.save()


@method_decorator(csrf_exempt, name="dispatch")
class UserLoginView(views.APIView):
    """로그인"""

    permission_classes = [AllowAny]
    authentication_classes = []  # 인증 클래스 비활성화

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "이메일과 비밀번호를 모두 입력해주세요."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(email=email, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "message": "로그인 성공",
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    },
                    "user": {"email": user.email, "nickname": user.nickname},
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"error": "이메일 또는 비밀번호가 잘못되었습니다."},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class UserProfileView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user, context={"request": request})
        return Response({"message": "프로필 조회 성공", "data": serializer.data})

    def put(self, request):
        serializer = UserProfileUpdateSerializer(
            request.user, data=request.data, context={"request": request}, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {
                "message": "프로필이 수정되었습니다.",
                "data": UserProfileSerializer(
                    request.user, context={"request": request}
                ).data,
            }
        )

    def delete(self, request):
        serializer = UserDeleteSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.is_active = False
        request.user.save()
        logout(request)
        return Response(
            {"message": "회원 탈퇴가 완료되었습니다."},
            status=status.HTTP_204_NO_CONTENT,
        )


class FollowView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            target_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"error": "사용자를 찾을 수 없습니다."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if target_user == request.user:
            return Response(
                {"error": "자기 자신을 팔로우할 수 없습니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        follow, created = Follow.objects.get_or_create(
            follower=request.user, following=target_user
        )

        if created:
            return Response({"message": f"{target_user.nickname}님을 팔로우했습니다."})
        return Response(
            {"message": "이미 팔로우하고 있습니다."}, status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        try:
            target_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"error": "사용자를 찾을 수 없습니다."},
                status=status.HTTP_404_NOT_FOUND,
            )

        follow = Follow.objects.filter(
            follower=request.user, following=target_user
        ).first()
        if follow:
            follow.delete()
            return Response(
                {"message": f"{target_user.nickname}님을 언팔로우했습니다."}
            )
        return Response(
            {"message": "팔로우하고 있지 않습니다."}, status=status.HTTP_400_BAD_REQUEST
        )


class UserFollowersView(generics.ListAPIView):
    serializer_class = FollowSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            user = User.objects.get(pk=self.kwargs["pk"])
            return Follow.objects.filter(following=user)
        except User.DoesNotExist:
            return Follow.objects.none()


class UserFollowingView(generics.ListAPIView):
    serializer_class = FollowSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            user = User.objects.get(pk=self.kwargs["pk"])
            return Follow.objects.filter(follower=user)
        except User.DoesNotExist:
            return Follow.objects.none()


class UserChallengeCategoryView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
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

    def post(self, request):
        category, created = UserChallengeCategory.objects.get_or_create(
            user=request.user
        )
        serializer = UserChallengeCategorySerializer(
            category, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class LogoutView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"message": "로그아웃 되었습니다."}, status=status.HTTP_200_OK)


class ValidationView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        email = request.query_params.get("email")
        nickname = request.query_params.get("nickname")

        if email:
            serializer = EmailCheckSerializer(data={"email": email})
            if serializer.is_valid():
                return Response({"message": "사용 가능한 이메일입니다."})
            return Response(
                {"message": "이미 사용 중인 이메일입니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        elif nickname:
            serializer = NicknameCheckSerializer(data={"nickname": nickname})
            if serializer.is_valid():
                return Response({"message": "사용 가능한 닉네임입니다."})
            return Response(
                {"message": "이미 사용 중인 닉네임입니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"message": "email 또는 nickname 파라미터가 필요합니다."},
            status=status.HTTP_400_BAD_REQUEST,
        )


class UserRecommendationsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # FastAPI 서버로 요청 보내기
            response = requests.post(
                f"{settings.FASTAPI_URL}/recommend",
                json={"id": request.user.id},
                timeout=10,
            )
            response.raise_for_status()

            # FastAPI로부터 받은 추천 사용자 ID 목록
            recommended_users_data = response.json()

            # 추천된 사용자들의 상세 정보 조회
            recommendations = []
            for user_data in recommended_users_data:
                user_id = user_data["id"]
                try:
                    user = User.objects.get(id=user_id)
                    user_info = {
                        "id": user.id,
                        "nickname": user.nickname,
                        "profile_image": user.profile_image,
                        "similarity": round(float(user_data.get("similarity", 0)), 3),
                    }
                    recommendations.append(user_info)
                except User.DoesNotExist:
                    continue

            return Response(
                {"message": "추천 사용자 조회 성공", "data": recommendations}
            )

        except requests.RequestException as e:
            return Response(
                {"error": "추천 시스템 서버와 통신 중 오류가 발생했습니다."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as e:
            return Response(
                {"error": "추천 사용자 조회 중 오류가 발생했습니다."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
