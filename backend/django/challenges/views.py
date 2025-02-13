from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
import requests
import json
import logging
from datetime import date
from accounts.models import User
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

logger = logging.getLogger(__name__)


class ChallengeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "description"]

    def get_queryset(self):
        queryset = Challenge.objects.exclude(status=3).select_related(
            "creator"
        )  # Exclude deleted challenges

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
        challenge = serializer.save(creator=self.request.user)

        # 챌린지 생성자를 참여자로 자동 등록
        ChallengeParticipant.objects.create(
            challenge=challenge,
            user=self.request.user,
            initial_budget=challenge.budget,
            balance=challenge.budget,
        )

    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.creator.id != self.request.user.id:
            raise PermissionDenied("챌린지 생성자만 수정할 수 있습니다")
        if instance.status != 0:  # RECRUIT
            raise PermissionDenied("모집 중인 챌린지만 수정할 수 있습니다")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.creator.id != self.request.user.id:
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

        try:
            # 다중 이미지 받은 후 OCR 서버 호출
            files = []
            for file_key, file in request.FILES.items():
                files.append(("files", file))  # files 파라미터로 여러 파일 전송

            response = requests.post(
                "http://54.180.9.205:8001/extract_text/", files=files, timeout=90
            )

            if response.status_code != 200:
                return Response(
                    {"error": "OCR 처리 중 오류가 발생했습니다"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            return Response(response.json())

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # OCR 데이터 저장
    @action(detail=False, methods=["post"])
    def ocr_save(self, request, challenge_id=None):
        challenge = get_object_or_404(Challenge, id=challenge_id)
        participant = get_object_or_404(
            ChallengeParticipant, challenge=challenge, user=request.user
        )

        if challenge.status != 1:  # IN_PROGRESS
            return Response(
                {"error": "진행 중인 챌린지만 OCR 데이터를 저장할 수 있습니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            data = request.data

            # 필수 필드 검증
            required_fields = ["store", "amount", "payment_date", "is_handwritten"]
            if not all(field in data for field in required_fields):
                return Response(
                    {"error": "필수 필드가 누락되었습니다"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 참가자의 잔액 확인 및 업데이트
            expense_amount = int(data["amount"])
            if participant.balance < expense_amount:
                return Response(
                    {"error": "예산이 부족합니다"}, status=status.HTTP_400_BAD_REQUEST
                )

            # 잔액 업데이트
            participant.balance -= expense_amount
            participant.save()

            # 지출 데이터 저장
            expense = Expense.objects.create(
                challenge=challenge,
                user=request.user,
                store=data["store"],
                amount=expense_amount,
                payment_date=data["payment_date"],
            )

            return Response(
                {
                    "message": "지출 내역이 저장되었습니다",
                    "expense_id": expense.id,
                    "remaining_balance": participant.balance,
                    "ocr_count": participant.ocr_count,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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
