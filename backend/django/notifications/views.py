from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer
from datetime import date
from accounts.models import User, Follow
from challenges.models import ChallengeInvite, Expense, Challenge
from django.shortcuts import get_object_or_404


class NotificationTemplate:
    @staticmethod
    def create_notification(user, notification_type, reference_id, content):
        """
        알림을 생성하는 헬퍼 함수
        """
        notification_data = {
            "user": user.id,
            "type": notification_type,
            "reference_id": reference_id,
            "content": content,
        }
        
        serializer = NotificationSerializer(data=notification_data)
        if serializer.is_valid():
            serializer.save()
            return serializer.data
        return None
    

class ChallengeInviteViewSet(viewsets.ViewSet):
    @action(detail=False, methods=["post"])
    def invite(self, request, *args, **kwargs):
        """
        특정 사용자에게 챌린지 초대 알림을 보냄
        """
        from_user_id = request.data.get("from_user_id")  # 초대하는 사용자 ID
        to_user_id = request.data.get("to_user_id")  # 초대받는 사용자 ID
        challenge_id = request.data.get("challenge_id")  # 챌린지 ID

        try:
            from_user = User.objects.get(id=from_user_id)
        except User.DoesNotExist:
            return Response({"error": "유효하지 않은 초대 사용자입니다."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            to_user = User.objects.get(id=to_user_id)
        except User.DoesNotExist:
            return Response({"error": "유효하지 않은 초대 대상 사용자입니다."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            challenge = Challenge.objects.get(id=challenge_id)
        except Challenge.DoesNotExist:
            return Response({"error": "유효하지 않은 챌린지입니다."}, status=status.HTTP_400_BAD_REQUEST)


        # 초대 내역 생성
        ChallengeInvite.objects.create(challenge=challenge, from_user=from_user, to_user=to_user)

        # 알림 생성
        notification_data = NotificationTemplate.create_notification(
            to_user.id, "challenge_invite", challenge.id, f"{from_user.nickname}님이 '{challenge.title}' 챌린지에 초대했습니다!",
        )

        serializer = NotificationSerializer(data=notification_data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class ChallengeEndNotificationViewSet(viewsets.ViewSet):
    def send_end_notifications(self, request, *args, **kwargs):
        """
        오늘 마감되는 챌린지에 대한 알림을 참여자에게 보냄
        """
        # 오늘 날짜
        today = date.today()

        # 마감일이 오늘인 챌린지를 조회
        challenges_ending_today = Challenge.objects.filter(end_date=today)

        if not challenges_ending_today.exists():
            return Response({"message": "오늘 마감되는 챌린지가 없습니다."}, status=status.HTTP_200_OK)

        # 각 챌린지에 대해
        for challenge in challenges_ending_today:
            # 챌린지에 참여한 사용자들 찾기
            participants = challenge.ChallengeParticipant.all()

            for participant in participants:
                # 알림 내용 구성
                notification_data = NotificationTemplate.create_notification(
                    participant.id, "challenge_end", challenge.id, f"'{challenge.title}' 챌린지가 오늘 마감됩니다. 참여 상황을 확인하세요!",
                )

                # 알림 생성
                serializer = NotificationSerializer(data=notification_data, context={"request": request})
                if serializer.is_valid():
                    serializer.save()

        return Response({"message": "마감 알림이 성공적으로 발송되었습니다."}, status=status.HTTP_200_OK)



class ExpenseReminderNotificationViewSet(viewsets.ViewSet):
    def send_expense_reminder_notifications(self, request, *args, **kwargs):
        """
        오늘 인증이 안 된 사용자에게 해당 챌린지의 인증 재촉 알림을 보냄
        """
        today = date.today()

        # 오늘 인증한 데이터 조회
        expenses_today = Expense.objects.filter(payment_date__date=today)

        # 오늘 인증하지 않은 사용자 찾기
        users_with_no_expense = User.objects.exclude(id__in=expenses_today.values('user'))

        if not users_with_no_expense.exists():
            return Response({"message": "오늘 인증이 없는 사용자가 없습니다."}, status=status.HTTP_200_OK)

        # 인증하지 않은 사용자들에게 알림 보내기
        for user in users_with_no_expense:
            # 사용자가 참여한 챌린지 찾기
            expenses = Expense.objects.filter(user=user, payment_date__date=today)
            for expense in expenses:
                # 챌린지 ID 가져오기
                challenge = expense.challenge
                # 알림 내용 구성
                notification_data = NotificationTemplate.create_notification(
                    user.id, "expense_reminder", challenge.id, f"'{challenge.title}' 챌린지의 인증을 하지 않았습니다. 인증을 진행해 주세요!",
                )

                # 알림 생성
                serializer = NotificationSerializer(data=notification_data, context={"request": request})
                if serializer.is_valid():
                    serializer.save()

        return Response({"message": "인증 재촉 알림이 성공적으로 발송되었습니다."}, status=status.HTTP_200_OK)


class FollowView(views.APIView):
    def post(self, request):
        follower_id = request.data.get("follower_id")
        following_id = request.data.get("following_id")

        if follower_id == following_id:
            return Response({"error": "자기 자신을 팔로우할 수 없습니다."}, status=status.HTTP_400_BAD_REQUEST)

        follower = get_object_or_404(User, id=follower_id)
        following = get_object_or_404(User, id=following_id)

        follow, created = Follow.objects.get_or_create(follower=follower, following=following)
        
        if not created:
            return Response({"message": "이미 팔로우한 사용자입니다."}, status=status.HTTP_400_BAD_REQUEST)

        notification_data = NotificationTemplate.create_notification(
            following,
            "new_follower",
            follower.id,
            f"{follower.nickname}님이 팔로우하였습니다."
        )

        if notification_data:
            return Response({"message": "팔로우 성공 및 알림 전송 완료.", "notification": notification_data}, status=status.HTTP_201_CREATED)
        
        return Response({"error": "알림 생성 실패"}, status=status.HTTP_400_BAD_REQUEST)
