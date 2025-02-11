from rest_framework import serializers
from django.db import transaction
from .models import User, EmailVerification, UserChallengeCategory, Follow
from api_error.system_exception import (
    Error,
    SystemError,
    SystemErrorList,
    SystemException,
)


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "nickname", "is_superuser", "is_active"]
        read_only_fields = fields


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
            "email",
            "nickname",
            "password1",
            "password2",
            "sex",
            "birth_date",
            "career",
            "tokens",
        ]

    def get_tokens(self, user):
        from rest_framework_simplejwt.tokens import RefreshToken

        refresh = RefreshToken.for_user(user)
        return {"refresh": str(refresh), "access": str(refresh.access_token)}

    @transaction.atomic
    def create(self, validated_data):
        if validated_data["password1"] != validated_data["password2"]:
            raise SystemException(
                SystemErrorList.errors[Error.USER_TWO_PASSWORD_DOES_NOT_EQUAL.value]
            )

        try:
            User.objects.get(email=validated_data["email"])
            raise SystemException(
                SystemErrorList.errors[Error.USER_EMAIL_ALREADY_EXIST.value],
                validated_data["email"],
            )
        except User.DoesNotExist:
            pass

        user = User(
            email=validated_data["email"],
            nickname=validated_data["nickname"],
            sex=validated_data.get("sex", "M"),
            birth_date=validated_data.get("birth_date"),
            career=validated_data.get("career"),
        )
        user.set_password(validated_data["password1"])
        user.save()
        return user


class UserChallengeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserChallengeCategory
        fields = [
            "cafe",
            "restaurant",
            "grocery",
            "shopping",
            "culture",
            "hobby",
            "drink",
            "transportation",
            "etc",
        ]

    def create(self, validated_data):
        user = self.context["request"].user
        # 이미 존재하는 카테고리가 있다면 업데이트
        category, created = UserChallengeCategory.objects.update_or_create(
            user=user, defaults=validated_data
        )
        return category


class FollowSerializer(serializers.ModelSerializer):
    follower_nickname = serializers.CharField(
        source="follower.nickname", read_only=True
    )
    following_nickname = serializers.CharField(
        source="following.nickname", read_only=True
    )

    class Meta:
        model = Follow
        fields = [
            "id",
            "follower",
            "following",
            "follower_nickname",
            "following_nickname",
            "created_at",
        ]
        read_only_fields = ["created_at"]


class UserProfileSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True, required=False)
    password2 = serializers.CharField(write_only=True, required=False)
    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    def get_follower_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()

    def get_is_following(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "nickname",
            "sex",
            "birth_date",
            "career",
            "total_saving",
            "introduction",
            "profile_image",
            "challenge_streak",
            "email_verified",
            "password1",
            "password2",
        ]
        read_only_fields = ["email", "email_verified", "challenge_streak"]

    @transaction.atomic
    def update(self, instance, validated_data):
        if "password1" in validated_data and "password2" in validated_data:
            if validated_data["password1"] != validated_data["password2"]:
                raise SystemException(
                    SystemErrorList.errors[Error.USER_TWO_PASSWORD_DOES_NOT_EQUAL.value]
                )
            instance.set_password(validated_data["password1"])
            validated_data.pop("password1")
            validated_data.pop("password2")

        return super().update(instance, validated_data)
