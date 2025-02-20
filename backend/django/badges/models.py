# Create your models here.
from django.conf import settings
from django.db import models


class Badge(models.Model):
    TYPE_CHOICES = [
        (0, "point"),  # 절약 포인트
        (1, "streak"),  # 챌린지 인증 성공 날짜 수
        (2, "hidden"),  # 추후 히든 뱃지 추가 시 사용
    ]

    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255, default="")
    badge_type = models.PositiveSmallIntegerField(choices=TYPE_CHOICES, default=0)
    required_date = models.PositiveSmallIntegerField(null=True)
    required_money = models.PositiveIntegerField(null=True)
    image_url = models.CharField(max_length=255, null=True)

    class Meta:
        db_table = "Badge"


class UserBadge(models.Model):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    achieved_at = models.DateField()

    class Meta:
        db_table = "UserBadge"
        unique_together = ("user", "badge")
