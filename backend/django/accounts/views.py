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
    UserDeleteSerializer
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