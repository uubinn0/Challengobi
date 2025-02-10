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

    def create_user(self, email, password, **kwargs):
        kwargs.setdefault("is_admin", False)
        return self._create_user(email, password, **kwargs)

    def create_superuser(self, email, password, **kwargs):
        kwargs.setdefault("is_superuser", True)
        kwargs.setdefault("is_active", True)
        kwargs.setdefault("is_staff", True)
        return self._create_user(email, password, **kwargs)


class User(AbstractUser):
    objects = MyUserManager()

    username = models.CharField(_("username"), max_length=150, blank=True)
    email = models.EmailField(_("email"), max_length=150, unique=True)
    nickname = models.CharField(max_length=255, unique=True)
    sex = models.CharField(
        max_length=1, choices=[("M", "Male"), ("F", "Female")], default="M"
    )
    birth_date = models.DateField(null=True)
    career = models.PositiveSmallIntegerField(null=True)
    total_saving = models.PositiveIntegerField(null=True)
    introduction = models.TextField(null=True, blank=True)
    profile_image = models.ImageField(upload_to="profiles/", null=True, blank=True)
    challenge_streak = models.PositiveSmallIntegerField(default=0)
    email_verified = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nickname"]

    class Meta:
        db_table = "User"


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
