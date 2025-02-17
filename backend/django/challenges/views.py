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
from accounts.serializers import UserListSerializer
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
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "description"]

    def get_queryset(self):
        queryset = Challenge.objects.exclude(status=3).select_related(
            "creator"
        )  # Exclude deleted challenges

        # 1. 자신이 생성한 챌린지는 모두 표시
        # 2. Public 챌린지는 모두 표시
        # 3. Private 챌린지 중 초대받은 것만 표시
        queryset = queryset.filter(
            Q(creator=self.request.user)  # 내가 만든 챌린지
            | Q(visibility=False)  # Public 챌린지
            | Q(
                visibility=True, challengeinvite__to_user=self.request.user
            )  # 초대받은 Private 챌린지
        ).distinct()

        status_param = self.request.query_params.get("status")
        if status_param == "recruiting":
            today = date.today()
            queryset = queryset.filter(status=0, start_date__gt=today)  # RECRUIT
        elif status_param == "in_progress":
            queryset = queryset.filter(status=1)  # IN_PROGRESS

        # 검색어 필터링
        search_keyword = self.request.query_params.get("search")
        if search_keyword:
            # Private 챌린지는 검색에서 제외
            queryset = queryset.filter(
                Q(visibility=False)  # Public 챌린지만 검색
                & (
                    Q(title__icontains=search_keyword)
                    | Q(description__icontains=search_keyword)
                )
            )

        category = self.request.query_params.get("category")
        if category:
            # 카테고리명으로 매핑
            category_mapping = {
                "cafe": 1,
                "restaurant": 2,
                "grocery": 3,
                "shopping": 4,
                "culture": 5,
                "hobby": 6,
                "drink": 7,
                "transportation": 8,
                "etc": 9,
            }
            category_id = category_mapping.get(category.lower())
            if category_id:
                queryset = queryset.filter(category=category_id)

        search_keyword = self.request.query_params.get("search")
        if search_keyword:
            queryset = queryset.filter(
                Q(title__icontains=search_keyword)
                | Q(description__icontains=search_keyword)
            )

        # 카테고리 필터링이 있는 경우
        if category:
            queryset = queryset.filter(category=category)

        return queryset.order_by("-created_at")

    @action(detail=True, methods=["get"])
    def invitable_users(self, request, pk=None):
        challenge = self.get_object()

        # Private 챌린지가 아닌 경우 에러
        if not challenge.visibility:
            return Response(
                {"error": "Public 챌린지는 초대 기능을 사용할 수 없습니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 챌린지 생성자의 팔로워 목록 조회
        followers = (
            User.objects.filter(following__follower=challenge.creator)
            .exclude(
                # 이미 참여 중인 사용자 제외
                id__in=challenge.challengeparticipant_set.values_list(
                    "user_id", flat=True
                )
            )
            .exclude(
                # 이미 초대된 사용자 제외
                id__in=challenge.challengeinvite_set.values_list(
                    "to_user_id", flat=True
                )
            )
        )

        serializer = UserListSerializer(followers, many=True)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()  # 검색 및 카테고리 필터가 적용된 상태

        today = date.today()

        # 기존 queryset에서 필터링
        recruiting_challenges = queryset.filter(status=0, start_date__gt=today)

        in_progress_challenges = queryset.filter(status=1)

        recruiting_serializer = ChallengeListSerializer(
            recruiting_challenges, many=True
        )
        in_progress_serializer = ChallengeListSerializer(
            in_progress_challenges, many=True
        )

        return Response(
            {
                "recruiting": recruiting_serializer.data,
                "in_progress": in_progress_serializer.data,
            }
        )

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

        # Private 챌린지인 경우 초대 여부 확인
        if challenge.visibility:
            invite_exists = ChallengeInvite.objects.filter(
                challenge=challenge, to_user=request.user
            ).exists()
            if not invite_exists:
                return Response(
                    {"error": "초대받은 사용자만 참여할 수 있는 챌린지입니다"},
                    status=status.HTTP_403_FORBIDDEN,
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
    def invite(self, request, challenge_id=None):
        challenge = get_object_or_404(Challenge, id=challenge_id)
        serializer = ChallengeInviteSerializer(
            data=request.data, context={"challenge": challenge, "request": request}
        )

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

    @action(detail=False, methods=["get"])
    def my_challenges(self, request):
        # 내가 참여중인 챌린지들 조회
        my_challenges = Challenge.objects.filter(
            challengeparticipant__user=request.user
        ).select_related("creator")

        # 모집중/진행중 챌린지 분리
        today = date.today()
        recruiting_challenges = my_challenges.filter(
            status=0, start_date__gt=today  # RECRUIT
        )
        in_progress_challenges = my_challenges.filter(status=1)  # IN_PROGRESS

        # 시리얼라이즈
        recruiting_serializer = ChallengeListSerializer(
            recruiting_challenges, many=True
        )
        in_progress_serializer = ChallengeListSerializer(
            in_progress_challenges, many=True
        )

        return Response(
            {
                "recruiting": recruiting_serializer.data,
                "in_progress": in_progress_serializer.data,
            }
        )

    # 참여자 목록 조회
    @action(detail=True, methods=["get"])
    def participants(self, request, pk=None):
        challenge = self.get_object()
        participants = ChallengeParticipant.objects.filter(challenge=challenge)
        # ChallengeParticipant에 대한 serializer가 필요합니다
        serializer = ChallengeParticipantSerializer(participants, many=True)
        return Response(serializer.data)

    # 관리자가 참여자 제거
    @action(detail=True, methods=["delete"])
    def remove_participant(self, request, pk=None, user_id=None):
        challenge = self.get_object()

        # 챌린지 생성자 확인
        if challenge.creator != request.user:
            raise PermissionDenied("챌린지 생성자만 참가자를 제외할 수 있습니다")

        # 모집 중인 챌린지인지 확인
        if challenge.status != 0:  # RECRUIT
            return Response(
                {"error": "모집 중인 챌린지에서만 참가자를 제외할 수 있습니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 챌린지 생성자 본인은 제외할 수 없음
        if int(user_id) == request.user.id:
            return Response(
                {"error": "챌린지 생성자는 제외할 수 없습니다"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 참가자 제외
        participant = get_object_or_404(
            ChallengeParticipant, challenge=challenge, user_id=user_id
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
            uploaded_files = request.FILES.getlist("files")
            if not uploaded_files:
                return Response(
                    {"error": "업로드된 이미지가 없습니다"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 이미지를 임시 저장하고 파일 경로 저장
            temp_files = []
            for file in uploaded_files:
                # 임시 파일 저장 경로 생성
                temp_dir = os.path.join(
                    settings.MEDIA_ROOT, "temp", str(challenge_id), str(request.user.id)
                )
                os.makedirs(temp_dir, exist_ok=True)

                temp_path = os.path.join(temp_dir, file.name)
                with open(temp_path, "wb+") as destination:
                    for chunk in file.chunks():
                        destination.write(chunk)
                temp_files.append(temp_path)

            # 세션에 임시 파일 경로 저장
            request.session[f"temp_files_{challenge_id}"] = temp_files

            return Response(
                {"message": "이미지가 성공적으로 업로드되었습니다"},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
            # 세션에서 임시 파일 경로 가져오기
            temp_files = request.session.get(f"temp_files_{challenge_id}", [])
            if not temp_files:
                return Response(
                    {
                        "error": "업로드된 이미지가 없습니다. 먼저 이미지를 업로드해주세요."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # FastAPI로 전송할 파일 준비
            files = []
            for temp_path in temp_files:
                if os.path.exists(temp_path):
                    files.append(("files", open(temp_path, "rb")))

            # FastAPI 호출
            response = requests.post(
                "http://fastapi-app:8001/extract_text/", files=files, timeout=90
            )

            # 임시 파일 삭제
            for file in files:
                file[1].close()
            for temp_path in temp_files:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

            # 세션에서 임시 파일 정보 삭제
            del request.session[f"temp_files_{challenge_id}"]

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
                del request.session[f"temp_files_{challenge_id}"]
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
            expenses_data = data.get("selected", [])  # JSON 배열로 지출 데이터 받기

            if not expenses_data:
                return Response(
                    {"error": "지출 데이터가 없습니다"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 각 지출 데이터의 필수 필드 검증
            required_fields = ["store", "amount"]
            for expense_data in expenses_data:
                if not all(field in expense_data for field in required_fields):
                    return Response(
                        {"error": "필수 필드가 누락되었습니다"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # 총 지출 금액 계산
            total_amount = sum(int(expense["amount"]) for expense in expenses_data)

            # 잔액 확인 : 예산이 부족하면 에러를 발생하는데 우리는 에러보다는 챌린지 실패 상태로 변경하는 로직
            # if participant.balance < total_amount:
            #     return Response(
            #         {"error": "예산이 부족합니다"},
            #         status=status.HTTP_400_BAD_REQUEST
            #     )

            # 잔액 업데이트
            participant.balance -= total_amount
            participant.save()

            # 지출 데이터 저장 및 잔액 업데이트 로직
            created_expenses = []
            for expense_data in expenses_data:
                expense = Expense.objects.create(
                    challenge=challenge,
                    user=request.user,
                    store=expense_data["store"],
                    amount=int(expense_data["amount"]),
                    payment_date=expense_data.get("payment_date"),
                )
                created_expenses.append(expense.id)

            # 오늘 날짜에 ocr_count가 증가했는지 확인
            today = timezone.now().date()
            last_ocr_date = getattr(participant, "last_ocr_date", None)

            # 날짜가 다르면 ocr_count 증가 및 날짜 업데이트
            if last_ocr_date != today:
                participant.ocr_count += 1
                participant.last_ocr_date = today
                participant.save()

            # 잔액이 0 이하가 되면 챌린지 실패 처리
            if participant.balance <= 0:
                participant.is_failed = 1  # FAILED 상태 코드
                participant.save()

                # 챌린지의 모든 참가자가 실패했는지 확인
                all_failed = not ChallengeParticipant.objects.filter(
                    challenge=challenge,
                    is_failed=0,  # 실패하지 않은 참가자가 있는지 확인
                ).exists()

                # 모든 참가자가 실패했다면 챌린지도 종료
                if all_failed:
                    challenge.status = 3  # FINISHED 상태 코드
                    challenge.save()

            return Response(
                {
                    "message": "지출 내역이 저장되었습니다",
                    "expense_ids": created_expenses,
                    "total_amount": total_amount,
                    "remaining_balance": participant.balance,
                    "ocr_count": participant.ocr_count,
                },
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SimpleExpenseViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SimpleExpenseCreateSerializer

    # 수기 데이터 저장
    @action(detail=False, methods=["post"])
    def simple_save(self, request, challenge_id):
        try:
            # 챌린지 존재 여부 확인
            challenge = get_object_or_404(Challenge, id=challenge_id)

            # 참가자 확인
            participant = get_object_or_404(
                ChallengeParticipant, challenge=challenge, user=request.user
            )

            # 챌린지가 진행중인지 확인
            if challenge.status != 1:  # IN_PROGRESS
                return Response(
                    {"error": "진행중인 챌린지가 아닙니다"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 이미 실패한 참가자인지 확인
            if participant.is_failed:
                return Response(
                    {"error": "이미 실패한 챌린지입니다"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            serializer = SimpleExpenseCreateSerializer(
                data=request.data,
                context={"challenge": challenge, "user": request.user},
            )

            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            # 오늘 날짜에 지출내역이 있는지 확인
            today = timezone.now().date()
            today_expense = Expense.objects.filter(
                challenge=challenge, user=request.user, payment_date=today
            ).exists()

            # 잔액 확인
            amount = serializer.validated_data["amount"]
            if participant.balance < amount:
                return Response(
                    {"error": "잔액이 부족합니다"}, status=status.HTTP_400_BAD_REQUEST
                )

            # 지출 내역 저장
            expense = serializer.save()

            # 잔액 업데이트
            participant.balance -= amount
            participant.save()

            # 오늘 첫 인증이면 ocr_count 증가
            if not today_expense:
                participant.ocr_count += 1
                participant.save()

            # 잔액이 0 이하거나 예산을 초과한 경우 챌린지 실패 처리
            challenge_budget = challenge.budget
            total_spent = challenge_budget - participant.balance

            if participant.balance <= 0 or total_spent > challenge_budget:
                participant.is_failed = 1
                participant.save()

                # 챌린지의 모든 참가자가 실패했는지 확인
                all_failed = not ChallengeParticipant.objects.filter(
                    challenge=challenge, is_failed=0
                ).exists()

                # 모든 참가자가 실패했다면 챌린지도 종료
                if all_failed:
                    challenge.status = 3  # FINISHED
                    challenge.save()

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
        challenge_id = self.kwargs.get("challenge_id")
        encourage = serializer.validated_data.get("encourage", False)
        want_to_join = serializer.validated_data.get("want_to_join", False)

        # 둘 다 False면 reaction 삭제
        if not encourage and not want_to_join:
            ChallengeLike.objects.filter(
                challenge_id=challenge_id, user=self.request.user
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
