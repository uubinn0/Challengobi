from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Post, Comment
from .serializers import PostListSerializer, PostDetailSerializer, CommentSerializer
from .permissions import IsParticipant, IsOwnerOrReadOnly


class PostViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsParticipant]

    def perform_create(self, serializer):
        challenge_id = self.kwargs.get("challenge_id")
        serializer.save(
            user=self.request.user, challenge_id=challenge_id, is_active=True
        )

    def get_queryset(self):
        queryset = Post.objects.filter(is_active=True)
        challenge_id = self.request.query_params.get("challenge_id")
        user_id = self.request.query_params.get("user_id")

        if challenge_id:
            queryset = queryset.filter(challenge_id=challenge_id)
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return PostListSerializer
        return PostDetailSerializer

    @action(detail=False, methods=["get"])
    def my_posts(self, request):
        """내가 작성한 게시글 목록을 조회합니다."""
        queryset = Post.objects.filter(user=request.user, is_active=True).order_by(
            "-created_at"
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = PostListSerializer(
                page, many=True, context={"request": request}
            )
            return self.get_paginated_response(serializer.data)

        serializer = PostListSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="users/(?P<user_id>[^/.]+)")
    def user_posts(self, request, user_id=None):
        """특정 사용자가 작성한 게시글 목록을 조회합니다."""
        # user_id가 현재 로그인한 사용자의 ID와 같은 경우
        if str(request.user.id) == str(user_id):
            return self.my_posts(request)

        queryset = Post.objects.filter(user_id=user_id, is_active=True).order_by(
            "-created_at"
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = PostListSerializer(
                page, many=True, context={"request": request}
            )
            return self.get_paginated_response(serializer.data)

        serializer = PostListSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def like(self, request, challenge_id=None, pk=None):
        post = self.get_object()
        like, created = post.postlike_set.get_or_create(
            user=request.user, defaults={"challenge": post.challenge}
        )
        if not created:
            like.delete()
            return Response({"status": "unliked"})
        return Response({"status": "liked"})


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsParticipant, IsOwnerOrReadOnly]

    def get_queryset(self):
        post_id = self.kwargs.get("post_id")
        return Comment.objects.filter(post_id=post_id, is_active=True)

    def perform_create(self, serializer):
        post_id = self.kwargs.get("post_id")
        serializer.save(user=self.request.user, post_id=post_id, is_active=True)
