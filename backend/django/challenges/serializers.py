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
    challenge_category = serializers.IntegerField(source="category")
    challenge_title = serializers.CharField(source="title")
    challenge_info = serializers.CharField(source="description")
    period = serializers.IntegerField(source="duration")

    class Meta:
        model = Challenge
        fields = [
            "challenge_category",
            "challenge_title",
            "challenge_info",
            "period",
            "start_date",
            "budget",
            "max_participants",
        ]

    def validate_start_date(self, value):
        if value <= timezone.now().date():
            raise serializers.ValidationError("시작일은 내일 이후여야 합니다")
        return value

    def validate_budget(self, value):
        if value <= 0:
            raise serializers.ValidationError("예산은 0보다 커야 합니다")
        return value

    def create(self, validated_data):
        category = validated_data.pop("category")
        title = validated_data.pop("title")
        description = validated_data.pop("description")
        duration = validated_data.pop("duration")

        validated_data["category"] = category
        validated_data["title"] = title
        validated_data["description"] = description
        validated_data["duration"] = duration
        validated_data["end_date"] = validated_data["start_date"] + timedelta(
            days=duration
        )
        validated_data["status"] = 0  # RECRUIT

        return super().create(validated_data)


class ChallengeListSerializer(serializers.ModelSerializer):
    challenge_id = serializers.IntegerField(source="id")
    challenge_title = serializers.CharField(source="title")
    period = serializers.IntegerField(source="duration")
    challenge_category = serializers.IntegerField(source="category")
    encourage_cnt = serializers.SerializerMethodField()
    want_cnt = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = [
            "challenge_id",
            "challenge_title",
            "period",
            "start_date",
            "end_date",
            "budget",
            "challenge_category",
            "max_participants",
            "encourage_cnt",
            "want_cnt",
        ]

    def get_encourage_cnt(self, obj):
        return obj.challengelike_set.filter(encourage=True).count()

    def get_want_cnt(self, obj):
        return obj.challengelike_set.filter(want_to_join=True).count()


class ChallengeDetailSerializer(serializers.ModelSerializer):
    challenge_title = serializers.CharField(source="title")
    challenge_info = serializers.CharField(source="description")
    challenge_category = serializers.IntegerField(source="category")
    user_budget = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = [
            "challenge_title",
            "challenge_info",
            "challenge_category",
            "start_date",
            "end_date",
            "budget",
            "max_participants",
            "user_budget",
        ]

    def get_user_budget(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            participant = obj.challengeparticipant_set.filter(user=request.user).first()
            if participant:
                return participant.balance
        return None


class ChallengeParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeParticipant
        fields = ["challenge", "user", "initial_budget", "balance", "is_failed"]


class ChallengeInviteSerializer(serializers.ModelSerializer):
    from_user_id = serializers.IntegerField(source="from_user.id")
    to_user_id = serializers.IntegerField(source="to_user.id")
    challenge_id = serializers.IntegerField(source="challenge.id")

    class Meta:
        model = ChallengeInvite
        fields = ["from_user_id", "to_user_id", "challenge_id"]


class ChallengeLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeLike
        fields = ["user", "challenge", "encourage", "want_to_join"]

    def validate(self, data):
        if not data.get("encourage") and not data.get("want_to_join"):
            raise serializers.ValidationError("최소 하나의 반응은 선택해야 합니다")
        return data


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ["store", "amount", "payment_date", "is_handwritten"]

    def validate_payment_date(self, value):
        challenge = self.context["challenge"]
        if not (challenge.start_date <= value.date() <= challenge.end_date):
            raise serializers.ValidationError("결제일이 챌린지 기간을 벗어났습니다")
        return value

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("결제 금액은 0보다 커야 합니다")
        return value
