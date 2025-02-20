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
    FollowWithStatusSerializer,
)
from .utils import upload_image_to_firebase, get_firebase_bucket
from rest_framework import status, generics, views
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.contrib.auth import authenticate, logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import requests, os, uuid
import firebase_admin
from firebase_admin import credentials, storage


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
        # 먼저 이미지 처리
        profile_image_url = None
        profile_image = request.FILES.get("profile_image")

        # 이미지가 있을 경우 Firebase에 업로드
        if profile_image:
            try:
                profile_image_url = upload_image_to_firebase(profile_image)
                # 이미지 URL을 request.data에 추가
                request.data._mutable = True
                request.data["profile_image"] = profile_image_url
                request.data._mutable = False
            except Exception as e:
                return Response(
                    {"error": f"이미지 업로드 중 오류가 발생했습니다: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
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
    """로그인"""

    permission_classes = [AllowAny]
    authentication_classes = []  # 인증 클래스 비활성화

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )

        if user:
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "message": "로그인 성공",
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    },
                    "user": UserProfileSerializer(
                        user, context={"request": request}
                    ).data,
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

    @action(detail=False, methods=["POST"])
    def update_profile_image(self, request):
        try:
            user = request.user
            image_file = request.FILES.get("profile_image")

            if not image_file:
                return Response(
                    {"error": "이미지 파일이 필요합니다."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                # Firebase에 이미지 업로드
                image_url = upload_image_to_firebase(image_file, user.id)
                
                # 기존 이미지가 있다면 Firebase에서 삭제
                if user.profile_image:
                    try:
                        bucket = get_firebase_bucket()
                        old_image_path = user.profile_image.split('/')[-1]
                        blob = bucket.blob(f'profile_images/{user.id}/{old_image_path}')
                        blob.delete()
                    except Exception as e:
                        print(f"기존 이미지 삭제 실패: {str(e)}")

                # DB에 새 이미지 URL 업데이트
                user.profile_image = image_url
                user.save()

                return Response({
                    'message': '이미지가 성공적으로 업로드되었습니다',
                    'profile_image': image_url
                }, status=status.HTTP_200_OK)

            except ValueError as ve:
                return Response(
                    {'error': str(ve)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserDetailView(views.APIView):
    """다른 사용자의 프로필 조회"""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            user = User.objects.get(id=pk)
            serializer = UserProfileSerializer(user, context={"request": request})
            data = serializer.data

            # 직접 is_following 필드 설정
            if request.user.is_authenticated:
                data["is_following"] = Follow.objects.filter(
                    follower=request.user, following=user
                ).exists()
            else:
                data["is_following"] = False

            return Response({"message": "프로필 조회 성공", "data": data})
        except User.DoesNotExist:
            return Response(
                {"error": "사용자를 찾을 수 없습니다."},
                status=status.HTTP_404_NOT_FOUND,
            )


class FollowView(views.APIView):
    def post(self, request, pk):
        # 팔로우 로직
        try:
            user_to_follow = User.objects.get(id=pk)
            Follow.objects.create(
                follower=request.user,  # 현재 로그인한 사용자
                following=user_to_follow  # 팔로우하려는 사용자
            )
            return Response({"message": "팔로우 성공"}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response(
                {"error": "사용자를 찾을 수 없습니다."}, 
                status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, pk):
        # 언팔로우 로직
        try:
            user_to_unfollow = User.objects.get(id=pk)
            follow = Follow.objects.filter(
                follower=request.user,
                following=user_to_unfollow
            ).first()
            
            if follow:
                follow.delete()
                return Response({"message": "언팔로우 성공"}, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "팔로우 관계가 없습니다."}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        except User.DoesNotExist:
            return Response(
                {"error": "사용자를 찾을 수 없습니다."}, 
                status=status.HTTP_404_NOT_FOUND
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
                f"{settings.FASTAPI_URL}/api/accounts/recommendations",
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


class FollowStatusView(views.APIView):
    def get(self, request, pk):
        follower = request.user.id  # 현재 로그인한 사용자
        following = pk  # 확인하려는 사용자
        
        is_following = Follow.objects.filter(
            follower_id=follower,
            following_id=following
        ).exists()
        
        return Response({"is_following": is_following})
