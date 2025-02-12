from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import (
    Challenge,
    ChallengeParticipant,
    ChallengeInvite,
    Expense,
    ChallengeLike,
)


class ChallengeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = [
            "category",
            "title",
            "description",
            "start_date",
            "duration",
            "visibility",
            "max_participants",
            "budget",
        ]

    def validate_start_date(self, value):
        if value <= timezone.now().date():
            raise serializers.ValidationError("시작일은 내일 이후여야 합니다")
        return value

    def validate_budget(self, value):
        if value <= 0:
            raise serializers.ValidationError("예산은 0보다 커야 합니다")
        return value

    def validate(self, data):
        if data["visibility"] is False and data["max_participants"] < 2:
            raise serializers.ValidationError(
                "공개 챌린지는 최소 2명 이상의 참여자가 필요합니다"
            )
        return data

    def create(self, validated_data):
        validated_data["end_date"] = validated_data["start_date"] + timedelta(
            days=validated_data["duration"]
        )
        validated_data["status"] = 0  # RECRUIT
        return super().create(validated_data)


class ChallengeListSerializer(serializers.ModelSerializer):
    participant_count = serializers.SerializerMethodField()
    is_participating = serializers.SerializerMethodField()
    creator_nickname = serializers.CharField(source="creator.nickname", read_only=True)
    reactions = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = [
            "id",
            "creator_nickname",
            "category",
            "title",
            "start_date",
            "duration",
            "budget",
            "status",
            "participant_count",
            "is_participating",
            "reactions",
        ]

    def get_participant_count(self, obj):
        return obj.challengeparticipant_set.count()

    def get_is_participating(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.challengeparticipant_set.filter(user=request.user).exists()
        return False

    def get_reactions(self, obj):
        encourage_count = obj.challengelike_set.filter(encourage=True).count()
        want_to_join_count = obj.challengelike_set.filter(want_to_join=True).count()
        return {
            "encourage_count": encourage_count,
            "want_to_join_count": want_to_join_count,
        }


class ChallengeDetailSerializer(serializers.ModelSerializer):
    creator_nickname = serializers.CharField(source="creator.nickname", read_only=True)
    participants = serializers.SerializerMethodField()
    reactions = serializers.SerializerMethodField()
    my_reaction = serializers.SerializerMethodField()
    remaining_days = serializers.SerializerMethodField()
    total_participants = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = [
            "id",
            "creator_nickname",
            "category",
            "title",
            "description",
            "start_date",
            "duration",
            "end_date",
            "visibility",
            "max_participants",
            "budget",
            "status",
            "progress_rate",
            "participants",
            "reactions",
            "my_reaction",
            "remaining_days",
            "total_participants",
        ]

    def get_participants(self, obj):
        return ChallengeParticipantSerializer(
            obj.challengeparticipant_set.all(), many=True
        ).data

    def get_reactions(self, obj):
        encourage_count = obj.challengelike_set.filter(encourage=True).count()
        want_to_join_count = obj.challengelike_set.filter(want_to_join=True).count()
        return {
            "encourage_count": encourage_count,
            "want_to_join_count": want_to_join_count,
        }

    def get_my_reaction(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            reaction = obj.challengelike_set.filter(user=request.user).first()
            if reaction:
                return {
                    "encourage": reaction.encourage,
                    "want_to_join": reaction.want_to_join,
                }
        return None

    def get_remaining_days(self, obj):
        if obj.status == 0:  # RECRUIT
            return (obj.start_date - timezone.now().date()).days
        elif obj.status == 1:  # IN_PROGRESS
            return (obj.end_date - timezone.now().date()).days
        return 0

    def get_total_participants(self, obj):
        return obj.challengeparticipant_set.count()


class ChallengeParticipantSerializer(serializers.ModelSerializer):
    user_nickname = serializers.CharField(source="user.nickname", read_only=True)
    expense_count = serializers.SerializerMethodField()
    total_expense = serializers.SerializerMethodField()

    class Meta:
        model = ChallengeParticipant
        fields = [
            "user_nickname",
            "initial_budget",
            "balance",
            "is_failed",
            "expense_count",
            "total_expense",
        ]

    def get_expense_count(self, obj):
        return Expense.objects.filter(challenge=obj.challenge, user=obj.user).count()

    def get_total_expense(self, obj):
        expenses = Expense.objects.filter(challenge=obj.challenge, user=obj.user)
        return sum(expense.amount for expense in expenses)


class ExpenseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = [
            "store",
            "amount",
            "payment_date",
            "is_handwritten",
        ]

    def validate_payment_date(self, value):
        challenge = self.context["challenge"]
        if not (challenge.start_date <= value.date() <= challenge.end_date):
            raise serializers.ValidationError("결제일이 챌린지 기간을 벗어났습니다")
        return value

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("결제 금액은 0보다 커야 합니다")
        return value


class ExpenseListSerializer(serializers.ModelSerializer):
    user_nickname = serializers.CharField(source="user.nickname", read_only=True)

    class Meta:
        model = Expense
        fields = [
            "id",
            "user_nickname",
            "store",
            "amount",
            "payment_date",
            "is_handwritten",
            "created_at",
        ]


class ChallengeLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeLike
        fields = [
            "challenge",
            "encourage",
            "want_to_join",
        ]

    def validate(self, data):
        if not data.get("encourage") and not data.get("want_to_join"):
            raise serializers.ValidationError("최소 하나의 반응은 선택해야 합니다")
        return data


class ChallengeInviteSerializer(serializers.ModelSerializer):
    from_user_nickname = serializers.CharField(
        source="from_user.nickname", read_only=True
    )
    challenge_title = serializers.CharField(source="challenge.title", read_only=True)

    class Meta:
        model = ChallengeInvite
        fields = [
            "id",
            "challenge",
            "from_user_nickname",
            "to_user",
            "challenge_title",
            "created_at",
        ]
        read_only_fields = ["from_user", "created_at"]
