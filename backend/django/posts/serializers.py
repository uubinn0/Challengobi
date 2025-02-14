from rest_framework import serializers
from .models import Post, PostLike, Comment


class CommentSerializer(serializers.ModelSerializer):
    user_nickname = serializers.CharField(source="user.nickname", read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "user",
            "user_nickname",
            "content",
            "created_at",
            "modified_at",
            "is_active",
        ]
        read_only_fields = ["user", "created_at", "modified_at"]


class PostListSerializer(serializers.ModelSerializer):
    post_id = serializers.IntegerField(source="id")
    user_id = serializers.IntegerField(source="user.id")
    user_nickname = serializers.CharField(source="user.nickname", read_only=True)
    challenge_id = serializers.IntegerField(source="challenge.id")
    post_title = serializers.CharField(source="title")
    post_content = serializers.CharField(source="content")
    post_created_at = serializers.DateTimeField(source="created_at")
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "post_id",
            "user_id",
            "user_nickname",
            "challenge_id",
            "post_title",
            "post_content",
            "post_created_at",
            "like_count",
            "comment_count",
            "is_liked",
        ]
        read_only_fields = ["user_id", "challenge_id", "post_created_at"]

    def get_like_count(self, obj):
        return obj.postlike_set.count()

    def get_comment_count(self, obj):
        return obj.comment_set.filter(is_active=True).count()

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.postlike_set.filter(user=request.user).exists()
        return False


class PostDetailSerializer(PostListSerializer):
    comments = serializers.SerializerMethodField()

    class Meta(PostListSerializer.Meta):
        fields = PostListSerializer.Meta.fields + ["content", "image_url", "comments"]

    def get_comments(self, obj):
        comments = obj.comment_set.filter(is_active=True)
        return CommentSerializer(comments, many=True).data
