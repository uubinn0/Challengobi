# Create your models here.
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
        (0, "RECRUIT"),
        (1, "IN_PROGRESS"),
        (2, "COMPLETED"),
        (3, "CANCELED"),
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
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    ocr_count = models.PositiveSmallIntegerField(default=0)
    initial_budget = models.IntegerField()
    balance = models.IntegerField()
    is_failed = models.BooleanField(null=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ChallengeParticipant"
        unique_together = ("challenge", "user")


class ChallengeInvite(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
    ]

    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    from_user = models.ForeignKey(
        "accounts.User", related_name="sent_invites", on_delete=models.CASCADE
    )
    to_user = models.ForeignKey(
        "accounts.User", related_name="received_invites", on_delete=models.CASCADE
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ChallengeInvite"


class Expense(models.Model):
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    store = models.CharField(max_length=255)
    amount = models.PositiveIntegerField()
    payment_date = models.DateTimeField()
    is_handwritten = models.BooleanField()
    receipt_image = models.ImageField(upload_to="receipts/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "Expense"


class OCRResult(models.Model):
    expense = models.OneToOneField(
        Expense, on_delete=models.CASCADE, null=True, blank=True
    )
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    image = models.ImageField(upload_to="ocr_images/")
    result_data = models.JSONField()
    status = models.CharField(max_length=20, default="processing")
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)


class DraftExpense(models.Model):
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    store = models.CharField(max_length=255)
    amount = models.PositiveIntegerField()
    payment_date = models.DateTimeField()
    is_handwritten = models.BooleanField()
    receipt_image = models.ImageField(
        upload_to="draft_receipts/", null=True, blank=True
    )
    ocr_result = models.ForeignKey(
        OCRResult, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)


class ChallengeLike(models.Model):
    REACTION_CHOICES = [("encourage", "Encourage"), ("want", "Want to Join")]

    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    reaction_type = models.CharField(max_length=10, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ChallengeLike"
        unique_together = ("challenge", "user", "reaction_type")
