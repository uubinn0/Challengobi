from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from datetime import datetime


class CustomUserManager(BaseUserManager):
    def _create_user(self, email, password=None, **kwargs):
        if not email:
            raise ValueError('이메일은 필수입니다.')
        email = self.normalize_email(email)
        user = self.model(email=email, **kwargs)
        user.set_password(password)
        user.save(using=self._db)

    def create_user(self, email, password, nickname, phone, sex, birth_date, career, **kwargs):
        """
        일반 유저 생성
        """
        kwargs.setdefault('is_admin', False)
        kwargs.setdefault('is_staff', False)
        kwargs.setdefault('is_superuser', False)

        return self._create_user(email, password, nickname=nickname, phone=phone, sex=sex, 
                                 birth_date=birth_date, career=career, **kwargs)

    def create_superuser(self, email, password, nickname, phone, sex, birth_date, career, **kwargs):
        """
        관리자 유저 생성
        """
        kwargs.setdefault('is_superuser', True)
        kwargs.setdefault('is_active', True)
        kwargs.setdefault('is_staff', True)

        return self._create_user(email, password, nickname=nickname, phone=phone, sex=sex, 
                                 birth_date=birth_date, career=career, **kwargs)



class User(AbstractBaseUser, PermissionsMixin):
    objects = CustomUserManager()

    USER_NO = models.AutoField(primary_key=True)
    user_id = models.CharField(max_length=20)
    nickname = models.CharField(
        max_length=100,
        unique=True,
        error_messages={
        'unique' : _("이미 존재하는 닉네임입니다."),
        },
        verbose_name="닉네임",)
    email = models.EmailField(
        max_length=150,
        unique=True,
        verbose_name=_("이메일"),)
    username = models.CharField(max_length=100, verbose_name="이름")
    SEX_CHOICES = [('M', '남성'),
                   ('F', '여성')]
    sex = models.CharField(max_length=1, choices=SEX_CHOICES, verbose_name="성별")
    birth_date = models.DateField(default=datetime.now, verbose_name="생년월일")
    career = models.PositiveIntegerField(default=0, verbose_name="직업코드")
    categories = models.JSONField(default=list, verbose_name="취향 카테고리")  # 카테고리 리스트용
    total_saving = models.PositiveIntegerField(default=0, verbose_name="티끌금액")
    introduction = models.TextField(null=True, blank=True, verbose_name="소개글")
    profile_image = models.ImageField(upload_to="profile_images/", null=True, blank=True, verbose_name="프로필 이미지")
    create_date = models.DateTimeField(auto_now_add=True, verbose_name="가입일")
    kakao_login = models.BooleanField(default=False, verbose_name="카카오 로그인 여부")
    continued_challenge = models.PositiveIntegerField(default=0, verbose_name="챌린지 성공일 수")

    # is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)


    USERNAME_FIELD = 'email'
    # 유저 생성시 보여지는 필드 목록
    REQUIRED_FIELDS = ['nickname', 'username']

    def clean(self):
        # DB 저장 전 중복 검사
        if User.objects.exclude(pk=self.pk).filter(email=self.email).exists():
            raise ValidationError({'email' : ("clean : 이미 존재하는 이메일입니다.")})
        if User.objects.exclude(pk=self.pk).filter(nickname=self.nickname).exists():
            raise ValidationError({'nickname' : ('clean : 이미 존재하는 닉네임입니다.')})
        
    def save(self, *args, **kwargs):
        # 중복 검사 후 저장
        self.full_clean()
        super().save(*args, **kwargs)

