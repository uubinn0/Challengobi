from django.contrib.auth import authenticate, logout
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate,logout
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
    UserProfileSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

class EmailCheckView(views.APIView):
    """이메일 중복 검사"""
    def post(self, request):
        serializer = EmailCheckSerializer(data=request.data)
        if serializer.is_valid():
            return Response({"message": "사용 가능한 이메일입니다."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class NicknameCheckView(views.APIView):
    """닉네임 중복 검사"""
    def post(self, request):
        serializer = NicknameCheckSerializer(data=request.data)
        if serializer.is_valid():
            return Response({"message": "사용 가능한 닉네임입니다."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class UserRegistrationView(generics.CreateAPIView):
    """회원가입"""
    serializer_class = UserCreateSerializer
    permission_classes = [AllowAny]
    authentication_classes = []  # 인증 클래스 비활성화
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.perform_create(serializer)
        
        # JWT 토큰 생성
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "message": "회원가입이 완료되었습니다.",
            "data": serializer.data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    def perform_create(self, serializer):
        return serializer.save()
    
@method_decorator(csrf_exempt, name='dispatch')
class UserLoginView(views.APIView):
    """로그인"""
    permission_classes = [AllowAny]
    authentication_classes = []  # 인증 클래스 비활성화
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                'error': '이메일과 비밀번호를 모두 입력해주세요.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(email=email, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': '로그인 성공',
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'user': {
                    'email': user.email,
                    'nickname': user.nickname
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': '이메일 또는 비밀번호가 잘못되었습니다.'
            }, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(views.APIView):
    """로그아웃"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"message": "로그아웃 되었습니다."}, status=status.HTTP_200_OK)
    

class UserDeleteView(views.APIView):
    """회원 탈퇴"""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        serializer = UserDeleteSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            request.user.delete()
            return Response({"message": "회원 탈퇴가 완료되었습니다."}, status=status.HTTP_204_NO_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ValidationView(views.APIView):
    """이메일/닉네임 중복 검사"""
    def get(self, request):
        email = request.query_params.get('email')
        nickname = request.query_params.get('nickname')
        
        if email:
            serializer = EmailCheckSerializer(data={'email': email})
            if serializer.is_valid():
                return Response({
                    "message": "사용 가능한 이메일입니다."
                }, status=status.HTTP_200_OK)
            return Response({
                "message": "이미 사용 중인 이메일입니다."
            }, status=status.HTTP_400_BAD_REQUEST)
            
        elif nickname:
            serializer = NicknameCheckSerializer(data={'nickname': nickname})
            if serializer.is_valid():
                return Response({
                    "message": "사용 가능한 닉네임입니다."
                }, status=status.HTTP_200_OK)
            return Response({
                "message": "이미 사용 중인 닉네임입니다."
            }, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({
            "message": "email 또는 nickname 파라미터가 필요합니다."
        }, status=status.HTTP_400_BAD_REQUEST)
    
class UserRegistrationCompleteView(views.APIView):
    """회원가입 완료"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            "message": "회원가입이 완료되었습니다.",
            "data": UserCreateSerializer(request.user).data
        }, status=status.HTTP_200_OK)

class ProfileImageUpdateView(generics.UpdateAPIView):
    """프로필 사진 변경"""
    queryset = User.objects.all()
    serializer_class = ProfileImageUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    
class UserProfileUpdateView(generics.UpdateAPIView):
    """닉네임, 한줄소개, 휴대폰번호, 생년월일, 직업 변경"""
    queryset = User.objects.all()
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    
class UserProfileView(views.APIView):
    """프로필 조회/수정/탈퇴"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """프로필 조회"""
        # 디버깅용 정보 출력
        # print("Authorization Header:", request.headers.get('Authorization'))
        # print("User ID:", request.user.id)
        # print("User:", request.user)
        # print("Is Anonymous:", request.user.is_anonymous)
        # print("Is Authenticated:", request.user.is_authenticated)
        
        if request.user.is_anonymous:
            return Response({
                "message": "인증되지 않은 사용자입니다."
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        serializer = UserProfileSerializer(request.user)
        return Response({
            "message": "프로필 조회 성공",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    
    def put(self, request):
        """프로필 수정"""
        serializer = UserProfileSerializer(
            request.user,
            data=request.data,
            partial=True  # 부분 업데이트 허용
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "프로필이 수정되었습니다.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request):
        """회원 탈퇴"""
        user = request.user
        user.is_active = False  # 실제 삭제 대신 비활성화
        user.save()
        return Response({
            "message": "회원 탈퇴가 완료되었습니다."
        }, status=status.HTTP_204_NO_CONTENT)
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

    @action(detail=True, methods=["get"])
    def followers(self, request, pk=None):
        """
        특정 사용자의 팔로워 목록을 조회합니다.
        """
        user = self.get_object()
        followers = Follow.objects.filter(following=user)
        serializer = FollowSerializer(followers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def following(self, request, pk=None):
        """
        특정 사용자의 팔로잉 목록을 조회합니다.
        """
        user = self.get_object()
        following = Follow.objects.filter(follower=user)
        serializer = FollowSerializer(following, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post", "delete"])
    def follow(self, request, pk=None):
        """
        팔로우/언팔로우 기능을 토글합니다.
        POST: 팔로우
        DELETE: 언팔로우
        """
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
