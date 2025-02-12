from rest_framework import serializers
from django.db import transaction
from .models import User, UserChallengeCategory, Follow


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
            raise serializers.ValidationError("비밀번호가 일치하지 않습니다.")

        user = User(
            email=validated_data["email"],
            nickname=validated_data["nickname"],
            sex=validated_data.get("sex", "M"),
            birth_date=validated_data["birth_date"],
            career=validated_data["career"],
        )
        user.set_password(validated_data["password1"])
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

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
            "follower_count",
            "following_count",
            "is_following",
        ]
        read_only_fields = ["email", "challenge_streak"]

    def get_follower_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()

    def get_is_following(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False


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
