from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import gettext_lazy as _

from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.db import models


class MyUserManager(BaseUserManager):
    def _create_user(self, email, password=None, **kwargs):
        if not email:
            raise ValueError("이메일은 필수입니다.")
        user = self.model(email=self.normalize_email(email), **kwargs)
        user.set_password(password)
        user.save(using=self._db)
        return user

    # 일반 유저 생성
    def create_user(self, email, password, **kwargs):
        kwargs.setdefault("is_admin", False)
        kwargs.setdefault("is_superuser", False)
        return self._create_user(email, password, **kwargs)

    # 관리자 생성
    def create_superuser(self, email, password, **kwargs):
        kwargs.setdefault("is_superuser", True)
        kwargs.setdefault("is_active", True)
        kwargs.setdefault("is_staff", True)
        return self._create_user(email, password, **kwargs)


class User(AbstractUser):
    objects = MyUserManager()

    id = models.AutoField(primary_key=True)
    username = models.CharField(_("username"), max_length=150, blank=True)
    email = models.EmailField(_("email"), max_length=150, unique=True)
    nickname = models.CharField(max_length=100,
        unique=True,
        error_messages={
        'unique' : _("이미 존재하는 닉네임입니다."),
        },
        verbose_name="닉네임",)
    sex = models.CharField(
        max_length=1, choices=[("M", "Male"), ("F", "Female")], default="M"
    )
    birth_date = models.DateField(null=False, blank=False)
    career = models.PositiveSmallIntegerField(null=False, blank=False)
    total_saving = models.PositiveIntegerField(default=0)
    introduction = models.TextField(null=True, blank=True)
    profile_image = models.ImageField(upload_to="profiles/", null=True, blank=True)
    create_at = models.DateTimeField(auto_now_add=True)
    social_login = models.CharField(null=True, default=0)
    challenge_streak = models.PositiveSmallIntegerField(default=0)

    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nickname"]

    class Meta:
        db_table = "User"


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
    cafe = models.BooleanField(default=0)
    restaurant = models.BooleanField(default=0)
    grocery = models.BooleanField(default=0)
    shopping = models.BooleanField(default=0)
    culture = models.BooleanField(default=0)
    hobby = models.BooleanField(default=0)
    drink = models.BooleanField(default=0)
    transportation = models.BooleanField(default=0)
    etc = models.BooleanField(default=0)

    class Meta:
        db_table = "UserChallengeCategory"
