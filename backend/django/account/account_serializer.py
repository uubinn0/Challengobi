
from rest_framework import serializers

# from page.models import Page
from rest_framework import status
from .models import User
from rest_framework.response import Response
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema, swagger_serializer_method

# from rest_framework_jwt import serializers as jwt_serializers
from rest_framework_simplejwt import serializers as jwt_serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from api_error.system_exception import Error, SystemError, SystemErrorList, SystemException


class UserListSerializer(serializers.ModelSerializer):
    USER_NO = serializers.IntegerField(read_only=True)
    user_id = serializers.IntegerField(read_only=True)
    email = serializers.CharField(read_only=True)
    nickname = serializers.CharField(read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ['USER_NO', 'user_id', 'email', 'nickname', 'is_superuser', 'is_active']

class UserCreateSerializer(serializers.ModelSerializer):
    password1 = serializers.RegexField(
        regex=r"^(?=.{8,15}$)(?=.*[A-Za-z])(?=.*[0-9])(?=.*\W).*$", write_only=True
    )
    password2 = serializers.RegexField(
        regex=r"^(?=.{8,15}$)(?=.*[A-Za-z])(?=.*[0-9])(?=.*\W).*$", write_only=True
    )
    tokens = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            'user_id', 'email', 'password1', 'password2', 'username', 'nickname', 'sex',
            'birth_date', 'career', 'categories', 'total_saving', 'introduction',
            'profile_image', 'create_date', 'is_superuser', 'is_staff', 'tokens'
        ]

        read_only_fields = ['total_saving', 'create_date', 'is_superuser', 'is_staff']

    def validate(self, data):
        """비밀번호 확인 검증"""
        if data['password1'] != data['password2']:
            raise serializers.ValidationError({"password": "비밀번호가 일치하지 않습니다."})
        return data


    def validate_categories(self, value):
        if not isinstance(value, list):  
            raise serializers.ValidationError("categories는 리스트여야 합니다.")
        if not value:  # 빈 리스트 방지
            raise serializers.ValidationError("최소 하나 이상의 카테고리를 선택해야 합니다.")
        return value


    def get_tokens(self, user):
        """사용자에 대한 JWT 토큰 생성"""
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }

    @transaction.atomic
    def create(self, validated_data):
        categories = validated_data.pop('categories')  # categories 제거

        user = User(
            email=validated_data['email'],
            user_id=validated_data['user_id'],
            username=validated_data['username'],
            nickname=validated_data['nickname'],
            sex=validated_data['sex'],
            birth_date=validated_data['birth_date'],
            categories=categories,
            career=validated_data['career'],
            introduction=validated_data.get('introduction', ''),  # 기본값 설정
            profile_image=validated_data.get('profile_image', None),  # 기본값 설정
            is_superuser=validated_data.get('is_superuser', False),
        )
        user.set_password(validated_data['password1'])

        # 이메일 중복 확인
        if User.objects.filter(email=validated_data['email']).exists():
            raise serializers.ValidationError({"email": "This email is already in use"})

        user.save()

        return user


class UserSerializer(serializers.ModelSerializer):

    email = serializers.CharField(read_only=True)
    is_superuser = serializers.BooleanField(required=False)
    is_active = serializers.BooleanField(required=False)
    password1 = serializers.CharField(
        min_length=5, max_length=12, write_only=True, required=False)
    password2 = serializers.CharField(
        min_length=5, max_length=12, write_only=True, required=False)

    class Meta:
        model = User
        fields = ['user_id', 'email', 'username', 'is_superuser', 'is_active',
                  'password1', 'password2']

    @transaction.atomic
    def update(self, instance, validated_data):
        if 'password1' in validated_data:
            instance.set_password(validated_data['password1'])

        instance.__dict__.update(**validated_data)
        instance.save()
        return instance
