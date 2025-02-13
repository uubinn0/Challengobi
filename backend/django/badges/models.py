# Create your models here.
from django.conf import settings
from django.db import models


class Badge(models.Model):
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255, null=True)
    required_date = models.PositiveSmallIntegerField()
    image_url = models.CharField(max_length=255)
    required_money = models.PositiveIntegerField()

    class Meta:
        db_table = "Badge"


class UserBadge(models.Model):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    is_achieved = models.BooleanField(default=False)
    achieved_at = models.DateField()

    class Meta:
        db_table = "UserBadge"
        unique_together = ("user", "badge")
