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
from accounts.models import User, UserChallengeCategory


def convert_number_to_korean(number):
    """숫자를 한글 금액으로 변환"""
    units = ["만", "천", "백", "십", ""]
    numbers = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"]

    if number == 0:
        return "0원"

    num_str = str(number)
    result = ""

    # 만 단위 처리
    if len(num_str) > 4:
        man = int(num_str[:-4])
        result += str(man) + "만"
        num_str = num_str[-4:]
        if int(num_str) == 0:
            return result + "원"

    # 천 단위 처리
    if len(num_str) > 3 and int(num_str[-4]) > 0:
        result += str(int(num_str[-4])) + "천"

    return result + "원"


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

    def update(self, instance, validated_data):
        # creator는 업데이트하지 않음
        if "creator_id" in validated_data:
            validated_data.pop("creator_id")

        if "category" in validated_data:
            instance.category = validated_data.pop("category")
        if "title" in validated_data:
            instance.title = validated_data.pop("title")
        if "description" in validated_data:
            instance.description = validated_data.pop("description")
        if "duration" in validated_data:
            instance.duration = validated_data.pop("duration")
        if "start_date" in validated_data:
            instance.start_date = validated_data.pop("start_date")
            instance.end_date = instance.start_date + timedelta(days=instance.duration)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class ChallengeListSerializer(serializers.ModelSerializer):
    challenge_id = serializers.IntegerField(source="id")
    challenge_title = serializers.CharField(source="title")
    creator_nickname = serializers.CharField(source="creator.nickname", read_only=True)
    period = serializers.IntegerField(source="duration")
    period_display = serializers.SerializerMethodField()
    challenge_category = serializers.IntegerField(source="category")
    category_name = serializers.SerializerMethodField()
    budget_display = serializers.SerializerMethodField()
    current_participants = serializers.SerializerMethodField()
    participants_display = serializers.SerializerMethodField()
    encourage_cnt = serializers.SerializerMethodField()
    want_cnt = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = [
            "challenge_id",
            "challenge_title",
            "creator_nickname",
            "period",
            "period_display",
            "start_date",
            "end_date",
            "budget",
            "budget_display",
            "challenge_category",
            "category_name",
            "max_participants",
            "current_participants",
            "participants_display",
            "encourage_cnt",
            "want_cnt",
        ]

    def get_period_display(self, obj):
        weeks = obj.duration // 7
        return f"{weeks}주"

    def get_budget_display(self, obj):
        return convert_number_to_korean(obj.budget)

    def get_category_name(self, obj):
        # UserChallengeCategory 모델의 필드 순서대로 매핑
        category_mapping = {
            1: "카페",
            2: "식당",
            3: "장보기",
            4: "쇼핑",
            5: "문화생활",
            6: "취미",
            7: "음주/흡연",
            8: "교통",
            9: "기타",
        }
        return category_mapping.get(obj.category, "기타")

    def get_encourage_cnt(self, obj):
        return obj.challengelike_set.filter(encourage=True).count()

    def get_want_cnt(self, obj):
        return obj.challengelike_set.filter(want_to_join=True).count()

    def get_current_participants(self, obj):
        return obj.challengeparticipant_set.count()

    def get_participants_display(self, obj):
        current = self.get_current_participants(obj)
        return f"{current}/{obj.max_participants}"


class ChallengeDetailSerializer(serializers.ModelSerializer):
    challenge_title = serializers.CharField(source="title")
    challenge_info = serializers.CharField(source="description")
    challenge_category = serializers.IntegerField(source="category")
    category_name = serializers.SerializerMethodField()
    budget_display = serializers.SerializerMethodField()
    creator_nickname = serializers.CharField(source="creator.nickname", read_only=True)
    current_participants = serializers.SerializerMethodField()
    participants_display = serializers.SerializerMethodField()
    user_budget = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = [
            "challenge_title",
            "challenge_info",
            "creator_nickname",
            "challenge_category",
            "category_name",
            "start_date",
            "end_date",
            "budget",
            "budget_display",
            "max_participants",
            "current_participants",
            "participants_display",
            "user_budget",
        ]

    def get_category_name(self, obj):
        category_mapping = {
            1: "카페",
            2: "식당",
            3: "장보기",
            4: "쇼핑",
            5: "문화생활",
            6: "취미",
            7: "음주/흡연",
            8: "교통",
            9: "기타",
        }
        return category_mapping.get(obj.category, "기타")

    def get_budget_display(self, obj):
        return convert_number_to_korean(obj.budget)

    def get_current_participants(self, obj):
        return obj.challengeparticipant_set.count()

    def get_participants_display(self, obj):
        current = self.get_current_participants(obj)
        return f"{current}/{obj.max_participants}"

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
        read_only_fields = ["user", "challenge"]

    # 반응 둘 다 취소하는 경우도 있어야 하나?
    # def validate(self, data):
    #     if not data.get("encourage") and not data.get("want_to_join"):
    #         raise serializers.ValidationError("최소 하나의 반응은 선택해야 합니다")
    #     return data


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
