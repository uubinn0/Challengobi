from django.shortcuts import render
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Post, Comment
from .serializers import (
    PostListSerializer,
    PostDetailSerializer,
    CommentSerializer,
    PostCreateSerializer,
)
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
        if self.action == "create":
            return PostCreateSerializer
        elif self.action == "update" or self.action == "partial_update":
            return PostCreateSerializer
        elif self.action == "list":
            return PostListSerializer
        return PostDetailSerializer

    def update(self, request, *args, **kwargs):
        """게시글을 수정합니다."""
        post = self.get_object()

        # 자신의 게시글만 수정할 수 있도록 확인
        if post.user != request.user:
            return Response(
                {"detail": "You do not have permission to update this post."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # 부분 업데이트인지 전체 업데이트인지 확인
        partial = kwargs.pop("partial", False)
        serializer = self.get_serializer(post, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # 수정 시간 업데이트
        post = serializer.save(modified_at=timezone.now())

        return Response(PostDetailSerializer(post, context={"request": request}).data)

    def partial_update(self, request, *args, **kwargs):
        """게시글을 부분 수정합니다."""
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """게시글을 소프트 삭제합니다."""
        post = self.get_object()

        # 자신의 게시글만 삭제할 수 있도록 확인
        if post.user != request.user:
            return Response(
                {"detail": "You do not have permission to delete this post."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # 소프트 삭제 처리
        post.is_active = False
        post.deleted_at = timezone.now()
        post.save()

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get", "delete"])
    def my_posts(self, request):
        """내가 작성한 게시글 목록을 조회하거나, 특정 게시글을 삭제합니다."""
        if request.method == "GET":
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

        elif request.method == "DELETE":
            # 삭제할 게시글 ID 확인
            post_id = request.query_params.get("post_id")
            if not post_id:
                return Response(
                    {"detail": "post_id parameter is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                post = Post.objects.get(id=post_id, user=request.user, is_active=True)
            except Post.DoesNotExist:
                return Response(
                    {
                        "detail": "Post not found or you don't have permission to delete it."
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            # 소프트 삭제 처리
            post.is_active = False
            post.deleted_at = timezone.now()
            post.save()

            return Response(status=status.HTTP_204_NO_CONTENT)

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

    def update(self, request, *args, **kwargs):
        """댓글을 수정합니다."""
        comment = self.get_object()

        # 자신의 댓글만 수정할 수 있도록 확인 (IsOwnerOrReadOnly에서도 처리되지만 명시적으로 추가)
        if comment.user != request.user:
            return Response(
                {"detail": "You do not have permission to update this comment."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # 부분 업데이트인지 전체 업데이트인지 확인
        partial = kwargs.pop("partial", False)
        serializer = self.get_serializer(comment, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # 수정 시간 업데이트
        comment = serializer.save(modified_at=timezone.now())

        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        """댓글을 부분 수정합니다."""
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """댓글을 소프트 삭제합니다."""
        comment = self.get_object()

        # 자신의 댓글만 삭제할 수 있도록 확인 (IsOwnerOrReadOnly에서도 처리되지만 명시적으로 추가)
        if comment.user != request.user:
            return Response(
                {"detail": "You do not have permission to delete this comment."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # 소프트 삭제 처리
        comment.is_active = False
        comment.deleted_at = timezone.now()
        comment.save()

        return Response(status=status.HTTP_204_NO_CONTENT)
