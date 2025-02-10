from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import (
    Challenge,
    ChallengeParticipant,
    Expense,
    ChallengeLike,
    ChallengeInvite,
    OCRResult,
    DraftExpense,
)
from .serializers import (
    ChallengeListSerializer,
    ChallengeDetailSerializer,
    ChallengeParticipantSerializer,
    ExpenseSerializer,
    OCRResultSerializer,
    DraftExpenseSerializer,
    ChallengeLikeSerializer,
    ChallengeInviteSerializer,
)


class ChallengeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "description"]

    def get_queryset(self):
        queryset = Challenge.objects.all()
        status = self.request.query_params.get("status")
        category = self.request.query_params.get("category")

        if status:
            queryset = queryset.filter(status=status)
        if category:
            queryset = queryset.filter(category=category)

        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return ChallengeListSerializer
        return ChallengeDetailSerializer

    @action(detail=True, methods=["post"])
    def join(self, request, pk=None):
        challenge = self.get_object()

        if challenge.status != 0:
            return Response(
                {"error": "모집 중인 챌린지가 아닙니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        participant = ChallengeParticipant.objects.create(
            challenge=challenge,
            user=request.user,
            initial_budget=challenge.budget,
            balance=challenge.budget,
        )

        return Response(ChallengeParticipantSerializer(participant).data)

    @action(detail=True, methods=["delete"])
    def leave(self, request, pk=None):
        challenge = self.get_object()
        ChallengeParticipant.objects.filter(
            challenge=challenge, user=request.user
        ).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

    @action(detail=False, methods=["post"])
    def ocr(self, request):
        challenge_id = request.data.get("challenge_id")
        image = request.data.get("image")

        ocr_result = OCRResult.objects.create(
            user=request.user, challenge_id=challenge_id, image=image
        )

        # OCR 처리 로직

        return Response(OCRResultSerializer(ocr_result).data)


class DraftExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = DraftExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DraftExpense.objects.filter(user=self.request.user)

    @action(detail=False, methods=["post"])
    def submit(self, request):
        drafts = self.get_queryset()
        for draft in drafts:
            Expense.objects.create(
                challenge=draft.challenge,
                user=draft.user,
                store=draft.store,
                amount=draft.amount,
                payment_date=draft.payment_date,
                is_handwritten=draft.is_handwritten,
                receipt_image=draft.receipt_image,
            )
        drafts.delete()
        return Response({"status": "submitted"})
