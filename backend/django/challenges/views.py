from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
import requests
from datetime import date

from .models import (
    Challenge,
    ChallengeParticipant,
    Expense,
    ChallengeLike,
    ChallengeInvite,
)
from .serializers import (
    ChallengeCreateSerializer,
    ChallengeListSerializer,
    ChallengeDetailSerializer,
    ChallengeParticipantSerializer,
    ExpenseCreateSerializer,
    ExpenseListSerializer,
    ChallengeLikeSerializer,
    ChallengeInviteSerializer,
)


class ChallengeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "description"]

    def get_queryset(self):
        queryset = Challenge.objects.all()

        # 상태별 필터링
        status = self.request.query_params.get("status")
        if status == "RECRUIT":
            today = date.today()
            queryset = queryset.filter(
                status=0, start_date__gt=today  # RECRUIT  # 시작일이 오늘 이후인 것만
            )
        elif status == "IN_PROGRESS":
            queryset = queryset.filter(status=1)  # IN_PROGRESS

        # 카테고리별 필터링
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        # 공개/비공개 필터링
        if not self.action == "list":  # list가 아닌 경우에만 비공개 챌린지 필터링
            queryset = queryset.filter(
                Q(visibility=False)  # 공개 챌린지
                | Q(challengeparticipant__user=self.request.user)  # 참여 중인 챌린지
                | Q(creator=self.request.user)  # 내가 만든 챌린지
            ).distinct()

        return queryset

    def get_serializer_class(self):
        if self.action == "create":
            return ChallengeCreateSerializer
        elif self.action == "list":
            return ChallengeListSerializer
        return ChallengeDetailSerializer

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    def perform_destroy(self, instance):
        if instance.creator != self.request.user:
            raise PermissionDenied("챌린지 생성자만 삭제할 수 있습니다")
        if instance.status != 0:  # RECRUIT
            raise PermissionDenied("모집 중인 챌린지만 삭제할 수 있습니다")
        instance.status = 3  # DELETED
        instance.save()

    @action(detail=True, methods=["post"])
    def join(self, request, pk=None):
        challenge = self.get_object()

        # 참여 가능 여부 검사
        if challenge.status != 0:
            return Response(
                {"error": "모집 중인 챌린지가 아닙니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if challenge.start_date <= date.today():
            return Response(
                {"error": "이미 시작된 챌린지입니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if challenge.challengeparticipant_set.count() >= challenge.max_participants:
            return Response(
                {"error": "최대 참여 인원을 초과했습니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 이미 참여 중인지 확인
        if ChallengeParticipant.objects.filter(
            challenge=challenge, user=request.user
        ).exists():
            return Response(
                {"error": "이미 참여 중인 챌린지입니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 참여자 생성
        participant = ChallengeParticipant.objects.create(
            challenge=challenge,
            user=request.user,
            initial_budget=challenge.budget,
            balance=challenge.budget,
        )

        return Response(
            ChallengeParticipantSerializer(participant).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def invite(self, request, pk=None):
        challenge = self.get_object()
        to_user = request.data.get("to_user")

        if challenge.status != 0:
            return Response(
                {"error": "모집 중인 챌린지가 아닙니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        invite = ChallengeInvite.objects.create(
            challenge=challenge, from_user=request.user, to_user_id=to_user
        )

        return Response(
            ChallengeInviteSerializer(invite).data, status=status.HTTP_201_CREATED
        )


class ExpenseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        challenge_id = self.kwargs.get("challenge_pk")
        return Expense.objects.filter(challenge_id=challenge_id, user=self.request.user)

    def get_serializer_class(self):
        if self.action in ["create", "update"]:
            return ExpenseCreateSerializer
        return ExpenseListSerializer

    def perform_create(self, serializer):
        challenge_id = self.kwargs.get("challenge_pk")
        challenge = get_object_or_404(Challenge, id=challenge_id)

        if challenge.status != 1:  # IN_PROGRESS
            raise PermissionDenied("진행 중인 챌린지만 소비내역을 등록할 수 있습니다")

        participant = get_object_or_404(
            ChallengeParticipant, challenge=challenge, user=self.request.user
        )

        serializer.save(challenge=challenge, user=self.request.user)

    @action(detail=False, methods=["post"])
    def ocr(self, request):
        challenge_id = self.kwargs.get("challenge_pk")
        challenge = get_object_or_404(Challenge, id=challenge_id)

        if challenge.status != 1:  # IN_PROGRESS
            return Response(
                {"error": "진행 중인 챌린지만 OCR을 사용할 수 있습니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # OCR 서버 호출
        files = {"image": request.FILES.get("image")}
        response = requests.post("http://your-ocr-server/analyze", files=files)

        if response.status_code != 200:
            return Response(
                {"error": "OCR 처리 중 오류가 발생했습니다"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(response.json())


class ChallengeLikeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChallengeLikeSerializer

    def get_queryset(self):
        return ChallengeLike.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        challenge = serializer.validated_data["challenge"]

        # 이미 존재하는 reaction이 있다면 업데이트
        reaction, created = ChallengeLike.objects.update_or_create(
            challenge=challenge,
            user=self.request.user,
            defaults={
                "encourage": serializer.validated_data.get("encourage", False),
                "want_to_join": serializer.validated_data.get("want_to_join", False),
            },
        )

        serializer.instance = reaction
