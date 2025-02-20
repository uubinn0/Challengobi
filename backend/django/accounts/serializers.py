from rest_framework import serializers
from django.db import transaction
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model, authenticate
from .models import UserChallengeCategory, Follow

User = get_user_model()

User = get_user_model()


class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "nickname", "is_superuser", "is_active"]
        read_only_fields = fields


# 이메일 중복 검사
class EmailCheckSerializer(serializers.Serializer):
    email = serializers.EmailField()


# 이메일 중복 검사
class EmailCheckSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("이미 사용 중인 이메일입니다.")
        return value


# 닉네임 중복 검사
class NicknameCheckSerializer(serializers.Serializer):
    nickname = serializers.CharField(max_length=100)

    def validate_nickname(self, value):
        if User.objects.filter(nickname=value).exists():
            raise serializers.ValidationError("이미 존재하는 닉네임입니다.")
        return value


# 관심 소비 카테고리 등록
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
        read_only_fields = ["user"]


class UserCreateSerializer(serializers.ModelSerializer):
    challenge_categories = UserChallengeCategorySerializer(
        source="challenge_category", required=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "nickname",
            "sex",
            "birth_date",
            "career",
            "introduction",
            "profile_image",
            "challenge_categories",
        ]
        extra_kwargs = {
            "password": {"write_only": True, "required": True},
            "username": {"required": True},
            "email": {"required": True},
            "nickname": {"required": True},
            "sex": {"required": True},
            "birth_date": {"required": True},
            "career": {"required": True},
            "introduction": {"required": False},
            "profile_image": {"required": False},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("이미 사용 중인 이메일입니다.")
        return value

    def validate_nickname(self, value):
        if User.objects.filter(nickname=value).exists():
            raise serializers.ValidationError("이미 존재하는 닉네임입니다.")
        return value

    def validate_career(self, value):
        valid_careers = dict(User.CAREER_CHOICES)
        if value not in valid_careers:
            raise serializers.ValidationError("올바른 직업을 선택해주세요.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        challenge_categories_data = validated_data.pop("challenge_categories")
        password = validated_data.pop("password")

        # 먼저 User 인스턴스 생성
        user = User.objects.create_user(password=password, **validated_data)

        # 그 다음 UserChallengeCategory 생성
        UserChallengeCategory.objects.create(user=user, **challenge_categories_data)

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    challenge_categories = UserChallengeCategorySerializer(
        source="challenge_category", required=False
    )
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
            if request.user == obj:  # 자기 자신의 프로필인 경우
                return None
            return Follow.objects.filter(
                follower=request.user,
                following=obj
            ).exists()
        return False

    def validate_nickname(self, value):
        if User.objects.filter(nickname=value).exists():
            raise serializers.ValidationError("이미 존재하는 닉네임입니다.")
        return value


# 관심 소비 카테고리 등록
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
        read_only_fields = ["user"]


# 회원 가입
class UserCreateSerializer(serializers.ModelSerializer):
    challenge_categories = UserChallengeCategorySerializer(
        source="challenge_category", required=True
    )

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "nickname",
            "sex",
            "birth_date",
            "career",
            "introduction",
            "profile_image",
            "challenge_categories",
        )
        extra_kwargs = {
            "password": {"write_only": True, "required": True},
            "username": {"required": True},
            "email": {"required": True},
            "nickname": {"required": True},
            "sex": {"required": True},
            "birth_date": {"required": True},
            "career": {"required": True},
            "introduction": {"required": False},
            "profile_image": {"required": False},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("이미 사용 중인 이메일입니다.")
        return value

    def validate_nickname(self, value):
        if User.objects.filter(nickname=value).exists():
            raise serializers.ValidationError("이미 존재하는 닉네임입니다.")
        return value

    def validate_career(self, value):
        valid_careers = dict(User.CAREER_CHOICES)
        if value not in valid_careers:
            raise serializers.ValidationError("올바른 직업을 선택해주세요.")
        return value

    def create(self, validated_data):
        challenge_categories_data = validated_data.pop("challenge_category")
        password = validated_data.pop("password")

        # 먼저 User 인스턴스 생성
        user = User.objects.create_user(password=password, **validated_data)

        # 그 다음 UserChallengeCategory 생성
        UserChallengeCategory.objects.create(user=user, **challenge_categories_data)

        return user

    def to_representation(self, instance):
        """사용자 정보를 반환할 때 관련된 challenge_categories 정보도 포함"""
        ret = super().to_representation(instance)
        try:
            challenge_categories = UserChallengeCategory.objects.get(user=instance)
            ret["challenge_categories"] = UserChallengeCategorySerializer(
                challenge_categories
            ).data
        except UserChallengeCategory.DoesNotExist:
            ret["challenge_categories"] = None
        return ret


# 로그인
class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(
            email=data["email"], password=data["password"]
        )  # email이랑 password만 받음
        if not user:
            raise serializers.ValidationError(
                "이메일 또는 비밀번호가 올바르지 않습니다."
            )
        return data


# 회원 탈퇴
class UserDeleteSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("비밀번호가 올바르지 않습니다.")
        return value

    def delete_user(self):
        user = self.context["request"].user
        user.delete()


# 임시 -> 팔로우 관련 필드 추가해야함
class UserProfileSerializer(serializers.ModelSerializer):
    challenge_categories = UserChallengeCategorySerializer(
        source="challenge_category", required=False
    )

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "nickname",
            "sex",
            "birth_date",
            "career",
            "introduction",
            "profile_image",
            "total_saving",  # total_saving 필드 추가
            "challenge_categories",  # UserChallengeCategorySerializer를 통해 가져옴
        )


# class UserProfileSerializer(serializers.ModelSerializer):
# follower_count = serializers.SerializerMethodField()
# following_count = serializers.SerializerMethodField()
# is_following = serializers.SerializerMethodField()

# class Meta:
#     model = User
#     fields = [
#         "id",
#         "email",
#         "nickname",
#         "sex",
#         "birth_date",
#         "career",
#         "total_saving",
#         "introduction",
#         "profile_image",
#         "challenge_streak",
#         "follower_count",
#         "following_count",
#         "is_following",
#     ]
#     read_only_fields = ["email", "challenge_streak"]

# def get_follower_count(self, obj):
#     return obj.followers.count()

# def get_following_count(self, obj):
#     return obj.following.count()

# def get_is_following(self, obj):
#     request = self.context.get("request")
#     if request and request.user.is_authenticated:
#         return Follow.objects.filter(follower=request.user, following=obj).exists()
#     return False


# 프로필 사진 변경
class ProfileImageUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["profile_image"]


# 개인정보 변경 (닉네임, 한줄소개, 휴대폰 번호, 생년월일, 직업)
class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["nickname", "introduction", "birth_date", "career"]

    def validate_nickname(self, value):
        user = self.context["request"].user
        # 현재 사용자의 닉네임이 아닌 다른 닉네임이 이미 존재하는 경우에만 에러
        if User.objects.exclude(id=user.id).filter(nickname=value).exists():
            raise serializers.ValidationError("이미 존재하는 닉네임입니다.")
        return value


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data["email"], password=data["password"])
        if not user:
            raise serializers.ValidationError(
                "이메일 또는 비밀번호가 올바르지 않습니다."
            )
        return data


class UserDeleteSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)

    def validate_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("비밀번호가 올바르지 않습니다.")
        return value


class ProfileImageUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["profile_image"]


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["nickname", "introduction", "birth_date", "career"]

    def validate_nickname(self, value):
        user = self.context["request"].user
        if User.objects.exclude(id=user.id).filter(nickname=value).exists():
            raise serializers.ValidationError("이미 존재하는 닉네임입니다.")
        return value


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
