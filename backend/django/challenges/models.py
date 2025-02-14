from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class Challenge(models.Model):
    CATEGORY_CHOICES = [
        (1, "카페/디저트"),
        (2, "외식"),
        (3, "장보기"),
        (4, "쇼핑"),
        (5, "문화생활"),
        (6, "취미/여가"),
        (7, "술/담배"),
        (8, "교통"),
        (9, "기타"),
    ]

    STATUS_CHOICES = [
        (0, "RECRUIT"),  # 모집중
        (1, "IN_PROGRESS"),  # 진행중
        (2, "COMPLETED"),  # 종료
        (3, "DELETED"),  # 삭제(취소)
    ]

    creator = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    category = models.PositiveSmallIntegerField(choices=CATEGORY_CHOICES)
    title = models.CharField(max_length=60)
    description = models.CharField(max_length=85, null=True)
    start_date = models.DateField()
    duration = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(7), MaxValueValidator(28)]
    )
    end_date = models.DateField()
    visibility = models.BooleanField(default=False)  # False: Public, True: Private
    max_participants = models.PositiveSmallIntegerField(
        default=1, validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    budget = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.PositiveSmallIntegerField(choices=STATUS_CHOICES, default=0)
    progress_rate = models.FloatField(default=0)

    class Meta:
        db_table = "Challenge"


class ChallengeParticipant(models.Model):
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    balance = models.IntegerField()
    is_failed = models.IntegerField(default=0)
    ocr_count = models.IntegerField(default=0)
    last_ocr_date = models.DateField(null=True)  # 마지막 OCR 카운트 증가 날짜
    initial_budget = models.IntegerField()
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ChallengeParticipant"
        unique_together = ("challenge", "user")


class ChallengeInvite(models.Model):
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    from_user = models.ForeignKey(
        "accounts.User", related_name="sent_invites", on_delete=models.CASCADE
    )
    to_user = models.ForeignKey(
        "accounts.User", related_name="received_invites", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ChallengeInvite"


class Expense(models.Model):
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    store = models.CharField(max_length=255, null=False)
    amount = models.PositiveIntegerField(null=False)
    payment_date = models.DateField(auto_now_add=True)
    is_handwritten = models.BooleanField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "Expense"


class ChallengeLike(models.Model):
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    encourage = models.BooleanField(default=False)  # 응원해요
    want_to_join = models.BooleanField(default=False)  # 참여하고 싶어요

    class Meta:
        db_table = "ChallengeLike"
        unique_together = ("challenge", "user")
