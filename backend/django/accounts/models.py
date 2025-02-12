from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.db import models
import uuid


# Create your models here.
class MyUserManager(BaseUserManager):
    def _create_user(self, email, password=None, **kwargs):
        if not email:
            raise ValueError("이메일은 필수입니다.")
        user = self.model(email=self.normalize_email(email), **kwargs)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password, **kwargs):
        kwargs.setdefault("is_admin", False)
        return self._create_user(email, password, **kwargs)

    def create_superuser(self, email, password, **kwargs):
        kwargs.setdefault("is_superuser", True)
        kwargs.setdefault("is_active", True)
        kwargs.setdefault("is_staff", True)
        return self._create_user(email, password, **kwargs)


class User(AbstractUser):
    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, verbose_name="고유번호"
    )
    user_id = models.CharField(max_length=255, unique=True, verbose_name="사용자 ID")
    username = models.CharField(max_length=100, verbose_name="사용자명")
    email = models.EmailField(max_length=255, unique=True, verbose_name="이메일")
    nickname = models.CharField(max_length=255, unique=True, verbose_name="닉네임")
    sex = models.CharField(
        max_length=1,
        choices=[("M", "Male"), ("F", "Female")],
        default="M",
        verbose_name="성별",
        help_text="M 또는 F",
    )
    birth_date = models.DateField(null=False, verbose_name="생년월일")
    career = models.PositiveSmallIntegerField(null=False, verbose_name="경력")
    total_saving = models.PositiveIntegerField(null=True, verbose_name="총 저축액")
    introduction = models.TextField(null=True, blank=True, verbose_name="자기소개")
    profile_image = models.ImageField(
        upload_to="profiles/",
        null=False,
        blank=False,
        verbose_name="프로필 이미지",
        help_text="형식: 회원아이디_profile_image.jpg",
    )
    created_at = models.DateField(default=timezone.now, verbose_name="가입일")
    kakao_login = models.CharField(
        max_length=255, null=True, blank=True, verbose_name="카카오 로그인"
    )
    challenge_streak = models.PositiveSmallIntegerField(
        default=0, verbose_name="도전 스트릭", help_text="뱃지 기준"
    )

    objects = MyUserManager()

    # 이메일을 기본 식별자로 사용
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nickname", "user_id", "username", "birth_date", "career"]

    class Meta:
        db_table = "User"
        verbose_name = "사용자"
        verbose_name_plural = "사용자들"

    def __str__(self):
        return f"{self.nickname} ({self.email})"


class EmailVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    verified = models.BooleanField(default=False)


class Follow(models.Model):
    follower = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="following"
    )
    following = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="followers"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "Follow"
        unique_together = ("follower", "following")


class UserChallengeCategory(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    cafe = models.BooleanField(null=True)
    restaurant = models.BooleanField(null=True)
    grocery = models.BooleanField(null=True)
    shopping = models.BooleanField(null=True)
    culture = models.BooleanField(null=True)
    hobby = models.BooleanField(null=True)
    drink = models.BooleanField(null=True)
    transportation = models.BooleanField(null=True)
    etc = models.BooleanField(null=True)

    class Meta:
        db_table = "UserChallengeCategory"
