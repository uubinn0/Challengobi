from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import F
from .models import Badge, UserBadge
from accounts.models import User
from .serializers import BadgeSerializer, UserBadgeSerializer


class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['POST'])
    def check_badges(self, request):
        user = request.user
        new_badges = []

        try:
            # 연속 달성일 수에 따른 뱃지 체크 (badge_type=0)
            if user.challenge_streak > 0:
                date_badges = Badge.objects.filter(
                    badge_type=1,
                    required_date__lte=user.challenge_streak
                )
                
                for badge in date_badges:
                    # get_or_create를 사용하여 중복 저장 방지
                    user_badge, created = UserBadge.objects.get_or_create(
                        user=user,
                        badge=badge
                    )
                    if created:  # 새로 생성된 경우에만 new_badges에 추가
                        new_badges.append(badge)

            # 누적 포인트에 따른 뱃지 체크 (badge_type=1)
            if user.total_saving > 0:
                money_badges = Badge.objects.filter(
                    badge_type=0,
                    required_money__lte=user.total_saving
                )
                
                for badge in money_badges:
                    # get_or_create를 사용하여 중복 저장 방지
                    user_badge, created = UserBadge.objects.get_or_create(
                        user=user,
                        badge=badge
                    )
                    if created:  # 새로 생성된 경우에만 new_badges에 추가
                        new_badges.append(badge)

            if new_badges:
                return Response({
                    "message": "새로운 뱃지를 획득했습니다!",
                    "badges": BadgeSerializer(new_badges, many=True).data
                })
            
            return Response({"message": "획득할 수 있는 새로운 뱃지가 없습니다."})

        except Exception as e:
            return Response({"error": str(e)}, status=400)


class UserBadgeViewSet(viewsets.ModelViewSet):
    serializer_class = UserBadgeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserBadge.objects.filter(user=self.request.user)
