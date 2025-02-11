from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings


class Notification(models.Model):
    TYPE_CHOICES = [
        ("challenge_invite", "챌린지 초대"),
        ("challenge_end", "챌린지 마감"),
        ("expense_reminder", "인증 재촉"),
        ("new_follower", "팔로우"),
        ("challenge_join", "챌린지 참여"),
        ("post_like", "게시글 좋아요"),
        ("post_comment", "게시글 댓글"),
    ]

    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    reference_id = models.PositiveIntegerField()
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "Notification"
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["user", "is_read"]),
        ]
