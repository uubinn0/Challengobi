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

    def create_user(self, email, password=None, **extra_fields):
        # 일반 유저 생성성
        if not email:
            raise ValueError('이메일은 필수 입력 사항입니다.')
        
        user = self.model(
            email=self.normalize_email(email),
            **extra_fields
        )
        
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        # 관리자 생성성
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    # AbstractUser의 기본 필드 중 사용하지 않을 필드들을 None으로 설정
    first_name = None
    last_name = None
    date_joined = None

    objects = MyUserManager()

    id = models.AutoField(primary_key=True)
    username = models.CharField(_("username"), max_length=150, blank=True)
    email = models.EmailField(_("email"), max_length=150, unique=True)
    nickname = models.CharField(
        max_length=100,
        unique=True,
        error_messages={
            "unique": _("이미 존재하는 닉네임입니다."),
        },
        verbose_name="닉네임",
        default="굴비"
    )
    sex = models.CharField(
        max_length=1, choices=[("M", "Male"), ("F", "Female")], default="M"
    )
    birth_date = models.DateField(null=False, blank=False, default="2000-01-01")
    CAREER_CHOICES = [
        (1, '학생'),
        (2, '대학(원)생'),
        (3, '취업준비생'),
        (4, '직장인'),
        (5, '주부'),
        (6, '프리랜서'),
    ]
    career = models.PositiveSmallIntegerField(
        choices=CAREER_CHOICES,
        null=False, 
        blank=False, 
        default=1
    )
    total_saving = models.PositiveIntegerField(default=0)
    introduction = models.TextField(null=True, blank=True)
    profile_image = models.ImageField(upload_to="profiles/", null=True, blank=True)
    create_at = models.DateTimeField(auto_now_add=True)
    social_login = models.CharField(max_length=255, null=True, default=0)
    challenge_streak = models.PositiveSmallIntegerField(default=0)

    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = MyUserManager()

    # 이메일을 기본 식별자로 사용
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nickname", "username", "birth_date", "career"]

    class Meta:
        db_table = "User"
        verbose_name = "사용자"
        verbose_name_plural = "사용자들"

    def __str__(self):
        return f"{self.nickname} ({self.email})"


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
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='challenge_category') # 역참조
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
