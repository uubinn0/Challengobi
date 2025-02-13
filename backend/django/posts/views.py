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
