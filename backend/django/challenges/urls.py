from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("", views.ChallengeViewSet, basename="challenge")

urlpatterns = [
    # 챌린지 기본 CRUD
    path("", views.ChallengeViewSet.as_view({"get": "list", "post": "create"})),
    path(
        "<int:pk>/",
        views.ChallengeViewSet.as_view(
            {"get": "retrieve", "put": "update", "delete": "destroy"}
        ),
    ),
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
    # 챌린지 참여자 조회
    path(
        "<int:pk>/participants/",
        views.ChallengeViewSet.as_view({"get": "participants"}),
        name="challenge-participants",
    ),
    # 챌린지 참여자 강퇴
    path(
        "<int:pk>/participants/<int:user_id>/",
        views.ChallengeViewSet.as_view({"delete": "remove_participant"}),
        name="challenge-remove-participant",
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
    # 이미지 업로드
    path(
        "<int:challenge_id>/expenses/upload/",
        views.ExpenseViewSet.as_view({"post": "upload_images"}),
        name="challenge-expense-upload",
    ),
    # OCR 호출 및 JSON 반환
    path(
        "<int:challenge_id>/expenses/ocr/",
        views.ExpenseViewSet.as_view({"post": "ocr"}),
        name="challenge-expense-ocr",
    ),
    # OCR 저장
    path(
        "<int:challenge_id>/expenses/verifications/",
        views.ExpenseViewSet.as_view({"post": "ocr_save"}),
        name="challenge-expense-ocr-save"
    ),
    # 간편 인증 소비내역 저장
    path(
        "<int:challenge_id>/expenses/verifications/simple/",
        views.SimpleExpenseViewSet.as_view({"post": "simple_save"}),
        name="challenge-expense-simple-save",
    ),

    # 게시판 기능은 posts 앱의 URL을 include
    path("<int:challenge_id>/posts/", include("posts.urls")),
    # 기본 라우터 포함
    path("", include(router.urls)),
]
