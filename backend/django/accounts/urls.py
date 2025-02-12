from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("", views.ChallengeViewSet, basename="challenge")

urlpatterns = [
    # 챌린지 기본 CRUD는 router에서 처리됨
    # POST /api/challenges/
    # GET /api/challenges/
    # GET /api/challenges/{id}/
    # PUT /api/challenges/{id}/
    # DELETE /api/challenges/{id}/
    # 챌린지 참여/탈퇴/초대
    path(
        "<int:pk>/join/",
        views.ChallengeViewSet.as_view({"post": "join"}),
        name="challenge-join",
    ),
    path(
        "<int:pk>/leave/",
        views.ChallengeViewSet.as_view({"delete": "leave"}),
        name="challenge-leave",
    ),
    path(
        "<int:pk>/invite/",
        views.ChallengeViewSet.as_view({"post": "invite"}),
        name="challenge-invite",
    ),
    # 챌린지 반응(응원/참여희망)
    path(
        "<int:challenge_id>/reactions/",
        views.ChallengeLikeViewSet.as_view(
            {
                "post": "create",
                "get": "list",
            }
        ),
        name="challenge-reactions",
    ),
    path(
        "<int:challenge_id>/reactions/<int:pk>/",
        views.ChallengeLikeViewSet.as_view({"delete": "destroy"}),
        name="challenge-reaction-detail",
    ),
    # 소비내역 및 OCR
    path(
        "<int:challenge_id>/expenses/",
        views.ExpenseViewSet.as_view({"get": "list", "post": "create"}),
        name="challenge-expenses",
    ),
    path(
        "<int:challenge_id>/expenses/<int:pk>/",
        views.ExpenseViewSet.as_view(
            {"get": "retrieve", "put": "update", "delete": "destroy"}
        ),
        name="challenge-expense-detail",
    ),
    path(
        "<int:challenge_id>/expenses/ocr/",
        views.ExpenseViewSet.as_view({"post": "ocr"}),
        name="challenge-expense-ocr",
    ),
    # 게시글 관련
    path(
        "<int:challenge_id>/posts/",
        views.PostViewSet.as_view({"get": "list", "post": "create"}),
        name="challenge-posts",
    ),
    path(
        "<int:challenge_id>/posts/<int:pk>/",
        views.PostViewSet.as_view(
            {"get": "retrieve", "put": "update", "delete": "destroy"}
        ),
        name="challenge-post-detail",
    ),
    path(
        "<int:challenge_id>/posts/<int:pk>/like/",
        views.PostViewSet.as_view({"post": "like"}),
        name="challenge-post-like",
    ),
    # 댓글 관련
    path(
        "<int:challenge_id>/posts/<int:post_id>/comments/",
        views.CommentViewSet.as_view({"get": "list", "post": "create"}),
        name="challenge-comments",
    ),
    path(
        "<int:challenge_id>/posts/<int:post_id>/comments/<int:pk>/",
        views.CommentViewSet.as_view({"put": "update", "delete": "destroy"}),
        name="challenge-comment-detail",
    ),
    # 기본 라우터 포함
    path("", include(router.urls)),
]
