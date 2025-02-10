from django.db import models
from django.conf import settings


# Create your models here.
class Post(models.Model):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    challenge = models.ForeignKey("challenges.Challenge", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField(null=True)
    image_url = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(null=True)
    deleted_at = models.DateTimeField(null=True)
    is_active = models.BooleanField(null=True)

    class Meta:
        db_table = "Post"


class PostLike(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    challenge = models.ForeignKey("challenges.Challenge", on_delete=models.CASCADE)
    is_liked = models.BooleanField(default=False)

    class Meta:
        db_table = "PostLike"
        unique_together = ("post", "user", "challenge")


class Comment(models.Model):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(null=True)
    deleted_at = models.DateTimeField(null=True)
    is_active = models.BooleanField(null=True)

    class Meta:
        db_table = "Comment"
