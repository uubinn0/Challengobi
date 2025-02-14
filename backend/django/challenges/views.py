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
    ExpenseCreateSerializer,
    SimpleExpenseCreateSerializer,
)
from django.conf import settings
import os

logger = logging.getLogger(__name__)


class ChallengeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # 기본 쿼리셋 (삭제된 챌린지 제외)
        queryset = Challenge.objects.exclude(status=3)
        
        # 검색어와 카테고리 파라미터 가져오기
        search = self.request.query_params.get('search')
        category = self.request.query_params.get('category')
        
        # 검색어가 있는 경우
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search)
            )
        
        # 카테고리 필터링이 있는 경우
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
        if self.action == 'create':
            return ChallengeCreateSerializer
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
            is_failed=False,
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

    # 참여자 목록 조회
    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        challenge = self.get_object()
        participants = ChallengeParticipant.objects.filter(challenge=challenge)
        # ChallengeParticipant에 대한 serializer가 필요합니다
        serializer = ChallengeParticipantSerializer(participants, many=True)
        return Response(serializer.data)

    # 관리자가 참여자 제거
    @action(detail=True, methods=['delete'])
    def remove_participant(self, request, pk=None, user_id=None):
        challenge = self.get_object()

        # 챌린지 생성자 확인
        if challenge.creator != request.user:
            raise PermissionDenied("챌린지 생성자만 참가자를 제외할 수 있습니다")

        # 모집 중인 챌린지인지 확인
        if challenge.status != 0:  # RECRUIT
            return Response(
                {"error": "모집 중인 챌린지에서만 참가자를 제외할 수 있습니다"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 챌린지 생성자 본인은 제외할 수 없음
        if int(user_id) == request.user.id:
            return Response(
                {"error": "챌린지 생성자는 제외할 수 없습니다"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 참가자 제외
        participant = get_object_or_404(
            ChallengeParticipant,
            challenge=challenge,
            user_id=user_id
        )
        participant.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class ExpenseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ExpenseCreateSerializer

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
        
        # 실패한 참가자 검증 추가
        if participant.is_failed:
            raise PermissionDenied("이미 실패한 챌린지는 소비내역을 등록할 수 없습니다")

        serializer.save(challenge=challenge, user=self.request.user)

    # 이미지 업로드를 위한 새로운 액션
    @action(detail=False, methods=["post"])
    def upload_images(self, request, challenge_id=None):
        challenge = get_object_or_404(Challenge, id=challenge_id)

        if challenge.status != 1:  # IN_PROGRESS
            return Response(
                {"error": "진행 중인 챌린지만 이미지를 업로드할 수 있습니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        participant = get_object_or_404(
            ChallengeParticipant, challenge=challenge, user=request.user
        )
        if participant.is_failed:
            return Response(
                {"error": "이미 실패한 챌린지는 이미지를 업로드할 수 없습니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            uploaded_files = request.FILES.getlist('files')
            if not uploaded_files:
                return Response(
                    {"error": "업로드된 이미지가 없습니다"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 이미지를 임시 저장하고 파일 경로 저장
            temp_files = []
            for file in uploaded_files:
                # 임시 파일 저장 경로 생성
                temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp', str(challenge_id), str(request.user.id))
                os.makedirs(temp_dir, exist_ok=True)
                
                temp_path = os.path.join(temp_dir, file.name)
                with open(temp_path, 'wb+') as destination:
                    for chunk in file.chunks():
                        destination.write(chunk)
                temp_files.append(temp_path)

            # 세션에 임시 파일 경로 저장
            request.session[f'temp_files_{challenge_id}'] = temp_files

            return Response(
                {"message": "이미지가 성공적으로 업로드되었습니다"},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # OCR 처리를 위한 기존 액션 수정
    @action(detail=False, methods=["post"])
    def ocr(self, request, challenge_id=None):
        challenge = get_object_or_404(Challenge, id=challenge_id)

        if challenge.status != 1:  # IN_PROGRESS
            return Response(
                {"error": "진행 중인 챌린지만 OCR을 사용할 수 있습니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 실패한 참가자 검증 추가
        participant = get_object_or_404(
            ChallengeParticipant, challenge=challenge, user=request.user
        )
        if participant.is_failed:
            return Response(
                {"error": "이미 실패한 챌린지는 OCR을 사용할 수 없습니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
        # 다중 이미지 받은 후 OCR 서버 호출
            files = []
            for file_key, file in request.FILES.items():
                files.append(('files', file))  # files 파라미터로 여러 파일 전송

            # FastAPI 호출
            response = requests.post(
                "http://54.180.9.205:8001/extract_text/",
                files=files,
                timeout=90
            )

            # 임시 파일 삭제
            for file in files:
                file[1].close()
            for temp_path in temp_files:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
            
            # 세션에서 임시 파일 정보 삭제
            del request.session[f'temp_files_{challenge_id}']

            if response.status_code != 200:
                return Response(
                    {"error": "OCR 처리 중 오류가 발생했습니다"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            return Response(response.json())

        except Exception as e:
            # 에러 발생 시에도 임시 파일 정리
            try:
                for file in files:
                    file[1].close()
                for temp_path in temp_files:
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
                del request.session[f'temp_files_{challenge_id}']
            except:
                pass

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

        # 실패한 참가자 검증
        if participant.is_failed:
            return Response(
                {"error": "이미 실패한 챌린지는 OCR 데이터를 저장할 수 없습니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            data = request.data
            
            # 필수 필드 검증
            required_fields = ['store', 'amount', 'payment_date', 'is_handwritten']
            if not all(field in data for field in required_fields):
                return Response(
                    {"error": "필수 필드가 누락되었습니다"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 참가자의 잔액 확인 및 업데이트
            expense_amount = int(data['amount'])
            if participant.balance < expense_amount:
                return Response(
                    {"error": "예산이 부족합니다"},
                    status=status.HTTP_400_BAD_REQUEST
                )
    

            # 잔액 업데이트
            participant.balance -= expense_amount
            participant.save()

            # 오늘 날짜에 지출내역이 있는지 확인
            today = timezone.now().date()
            today_expense = Expense.objects.filter(
                challenge=challenge,
                user=request.user,
                store=data['store'],
                amount=expense_amount,
                payment_date=data['payment_date'],
            )
            
            return Response(
                {
                    "message": "지출 내역이 저장되었습니다",
                    "expense_id": expense.id,
                    "amount": amount,
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
        challenge_id = self.kwargs.get('challenge_id')
        encourage = serializer.validated_data.get("encourage", False)
        want_to_join = serializer.validated_data.get("want_to_join", False)

        # 둘 다 False면 reaction 삭제
        if not encourage and not want_to_join:
            ChallengeLike.objects.filter(
                challenge_id=challenge_id,
                user=self.request.user
            ).delete()
            return

        # 이미 존재하는 reaction이 있다면 업데이트
        reaction, created = ChallengeLike.objects.update_or_create(
            challenge_id=challenge_id,
            user=self.request.user,
            defaults={
                "encourage": encourage,
                "want_to_join": want_to_join,
            },
        )

        serializer.instance = reaction
