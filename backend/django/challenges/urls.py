from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("", views.ChallengeViewSet, basename="challenge")

urlpatterns = [
    # 챌린지 기본 CRUD
    path("<int:challenge_id>/join/", views.ChallengeViewSet.as_view({"post": "join"})),
    path(
        "<int:challenge_id>/leave/", views.ChallengeViewSet.as_view({"delete": "leave"})
    ),
    # OCR & 소비내역
    path(
        "<int:challenge_id>/expenses/ocr/",
        views.ExpenseViewSet.as_view({"post": "ocr"}),
    ),
    path(
        "<int:challenge_id>/expenses/ocr/<int:ocr_id>/",
        views.ExpenseViewSet.as_view(
            {"get": "get_ocr_result", "put": "update_ocr_result"}
        ),
    ),
    path(
        "<int:challenge_id>/expenses/",
        views.ExpenseViewSet.as_view({"get": "list", "post": "create"}),
    ),
    path(
        "<int:challenge_id>/expenses/<int:expense_id>/",
        views.ExpenseViewSet.as_view(
            {"get": "retrieve", "put": "update", "delete": "destroy"}
        ),
    ),
    # 게시글
    path(
        "<int:challenge_id>/posts/",
        views.PostViewSet.as_view({"get": "list", "post": "create"}),
    ),
    path(
        "<int:challenge_id>/posts/<int:post_id>/",
        views.PostViewSet.as_view(
            {"get": "retrieve", "put": "update", "delete": "destroy"}
        ),
    ),
    path(
        "<int:challenge_id>/posts/drafts/",
        views.PostViewSet.as_view({"get": "list_drafts", "post": "create_draft"}),
    ),
    # 댓글
    path(
        "<int:challenge_id>/posts/<int:post_id>/comments/",
        views.CommentViewSet.as_view({"get": "list", "post": "create"}),
    ),
    path(
        "<int:challenge_id>/posts/<int:post_id>/comments/<int:comment_id>/",
        views.CommentViewSet.as_view({"put": "update", "delete": "destroy"}),
    ),
    # 반응 (좋아요, 응원해요 등)
    path(
        "<int:challenge_id>/reactions/",
        views.ReactionViewSet.as_view(
            {"get": "list", "post": "create", "delete": "destroy"}
        ),
    ),
    path("", include(router.urls)),
]
