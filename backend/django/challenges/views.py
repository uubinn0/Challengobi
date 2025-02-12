from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from datetime import date
from .models import (
    Challenge,
    ChallengeParticipant,
    ChallengeInvite,
    Expense,
    ChallengeLike,
)
from .serializers import (
    ChallengeCreateSerializer,
    ChallengeListSerializer,
    ChallengeDetailSerializer,
    ChallengeParticipantSerializer,
    ChallengeInviteSerializer,
    ChallengeLikeSerializer,
    ExpenseSerializer,
)


class ChallengeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "description"]

    def get_queryset(self):
        queryset = Challenge.objects.exclude(status=3)  # Exclude deleted challenges

        status_param = self.request.query_params.get("status")
        if status_param == "recruiting":
            today = date.today()
            queryset = queryset.filter(status=0, start_date__gt=today)  # RECRUIT
        elif status_param == "in_progress":
            queryset = queryset.filter(status=1)  # IN_PROGRESS

        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)

        search_keyword = self.request.query_params.get("search")
        if search_keyword:
            queryset = queryset.filter(
                Q(title__icontains=search_keyword)
                | Q(description__icontains=search_keyword)
            )

        return queryset

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ChallengeCreateSerializer
        elif self.action == "retrieve":
            return ChallengeDetailSerializer
        return ChallengeListSerializer

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.creator != self.request.user:
            raise PermissionDenied("챌린지 생성자만 수정할 수 있습니다")
        if instance.status != 0:  # RECRUIT
            raise PermissionDenied("모집 중인 챌린지만 수정할 수 있습니다")
        serializer.save()

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

        if ChallengeParticipant.objects.filter(
            challenge=challenge, user=request.user
        ).exists():
            return Response(
                {"error": "이미 참여 중인 챌린지입니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        participant = ChallengeParticipant.objects.create(
            challenge=challenge,
            user=request.user,
            initial_budget=challenge.budget,
            balance=challenge.budget,
        )

        return Response(status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def invite(self, request, pk=None):
        challenge = self.get_object()
        serializer = ChallengeInviteSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if challenge.status != 0:
            return Response(
                {"error": "모집 중인 챌린지가 아닙니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        invite = ChallengeInvite.objects.create(
            challenge=challenge,
            from_user=request.user,
            to_user_id=serializer.validated_data["to_user_id"],
        )

        return Response(status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["delete"])
    def leave(self, request, pk=None):
        challenge = self.get_object()
        participant = get_object_or_404(
            ChallengeParticipant, challenge=challenge, user=request.user
        )

        if challenge.status != 0:  # RECRUIT
            return Response(
                {"error": "모집 중인 챌린지만 탈퇴할 수 있습니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        participant.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChallengeLikeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChallengeLikeSerializer

    def get_queryset(self):
        return ChallengeLike.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ExpenseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        challenge_id = self.kwargs.get("challenge_id")
        return Expense.objects.filter(challenge_id=challenge_id, user=self.request.user)

    def perform_create(self, serializer):
        challenge_id = self.kwargs.get("challenge_id")
        challenge = get_object_or_404(Challenge, id=challenge_id)

        if challenge.status != 1:  # IN_PROGRESS
            raise PermissionDenied("진행 중인 챌린지만 소비내역을 등록할 수 있습니다")

        participant = get_object_or_404(
            ChallengeParticipant, challenge=challenge, user=self.request.user
        )

        serializer.save(challenge=challenge, user=self.request.user)

    @action(detail=False, methods=["post"])
    def ocr(self, request, challenge_id=None):
        challenge = get_object_or_404(Challenge, id=challenge_id)

        if challenge.status != 1:  # IN_PROGRESS
            return Response(
                {"error": "진행 중인 챌린지만 OCR을 사용할 수 있습니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if "image" not in request.FILES:
            return Response(
                {"error": "이미지 파일이 필요합니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # OCR 처리 로직 구현 필요
        return Response({"message": "OCR 처리 완료"})
