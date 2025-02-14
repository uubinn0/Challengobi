from django.urls import path
from . import views

urlpatterns = [
    # 게시글 CRUD
    path(
        "", views.PostViewSet.as_view({"get": "list", "post": "create"}), name="posts"
    ),
    path(
        "<int:pk>/",
        views.PostViewSet.as_view(
            {"get": "retrieve", "put": "update", "delete": "destroy"}
        ),
        name="post-detail",
    ),
    # 게시글 좋아요
    path(
        "<int:pk>/likes/", views.PostViewSet.as_view({"post": "like"}), name="post-like"
    ),
    # 댓글
    path(
        "<int:post_id>/comments/",
        views.CommentViewSet.as_view({"get": "list", "post": "create"}),
        name="comments",
    ),
    path(
        "<int:post_id>/comments/<int:pk>/",
        views.CommentViewSet.as_view({"put": "update", "delete": "destroy"}),
        name="comment-detail",
    ),
    path("me/", views.PostViewSet.as_view({"get": "my_posts"}), name="my-posts"),
    path(
        "users/<int:user_id>/",
        views.PostViewSet.as_view({"get": "user_posts"}),
        name="user-posts",
    ),
]
