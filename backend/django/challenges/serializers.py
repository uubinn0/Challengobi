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
from accounts.models import User, UserChallengeCategory, Follow


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
    is_private = serializers.BooleanField(source="visibility")

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
            "is_private",
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
    challenge_info = serializers.CharField(source="description")
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
    participants_nicknames = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = [
            "challenge_id",
            "challenge_title",
            "challenge_info",
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
            "participants_nicknames",
        ]

    def get_period_display(self, obj):
        weeks = obj.duration // 7
        return f"{weeks}주"

    def get_budget_display(self, obj):
        return convert_number_to_korean(obj.budget)

    def get_category_name(self, obj):
        # UserChallengeCategory 모델의 필드 순서대로 매핑
        category_mapping = {
            1: "카페/디저트",
            2: "외식",
            3: "장보기",
            4: "쇼핑",
            5: "문화생활",
            6: "취미/여가",
            7: "술/담배",
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

    def get_participants_nicknames(self, obj):
        return list(
            obj.challengeparticipant_set.select_related("user").values_list(
                "user__nickname", flat=True
            )
        )


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
            1: "카페/디저트",
            2: "외식",
            3: "장보기",
            4: "쇼핑",
            5: "문화생활",
            6: "취미/여가",
            7: "술/담배",
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
    user_nickname = serializers.CharField(source="user.nickname")
    profile_image = serializers.CharField(source="user.profile_image")
    user_id = serializers.IntegerField(
        source="user.id"
    )  # 프로필 페이지 이동을 위해 추가

    class Meta:
        model = ChallengeParticipant
        fields = [
            "challenge",
            "user_id",
            "user_nickname",
            "profile_image",
            "initial_budget",
            "balance",
            "is_failed",
        ]


class ChallengeInviteSerializer(serializers.ModelSerializer):
    to_user_id = serializers.IntegerField(write_only=True)
    to_user_nickname = serializers.CharField(source="to_user.nickname", read_only=True)
    from_user_nickname = serializers.CharField(
        source="from_user.nickname", read_only=True
    )
    challenge_title = serializers.CharField(source="challenge.title", read_only=True)

    class Meta:
        model = ChallengeInvite
        fields = [
            "id",
            "to_user_id",
            "to_user_nickname",
            "from_user_nickname",
            "challenge_title",
            "created_at",
        ]
        read_only_fields = ["from_user", "challenge"]

    def validate(self, data):
        challenge = self.context["challenge"]
        to_user_id = data["to_user_id"]
        from_user = self.context["request"].user

        # 자기 자신 초대 불가
        if to_user_id == from_user.id:
            raise serializers.ValidationError("자기 자신은 초대할 수 없습니다")

        # Private 챌린지인 경우 팔로워만 초대 가능
        if challenge.visibility:
            is_follower = Follow.objects.filter(
                follower=to_user_id, following=from_user
            ).exists()
            if not is_follower:
                raise serializers.ValidationError("팔로워만 초대할 수 있습니다")

        # 이미 초대된 사용자인지 확인
        if ChallengeInvite.objects.filter(
            challenge=challenge, to_user_id=to_user_id
        ).exists():
            raise serializers.ValidationError("이미 초대된 사용자입니다")

        # 이미 참여 중인 사용자인지 확인
        if ChallengeParticipant.objects.filter(
            challenge=challenge, user_id=to_user_id
        ).exists():
            raise serializers.ValidationError("이미 참여 중인 사용자입니다")

        return data


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


# 소비 내역 저장 시리얼라이저
class ExpenseCreateSerializer(serializers.ModelSerializer):
    challenge_id = serializers.IntegerField()
    user_id = serializers.IntegerField()

    class Meta:
        model = Expense
        fields = [
            "challenge_id",
            "user_id",
            "store",
            "amount",
            "payment_date",
            "is_handwritten",
        ]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("결제 금액은 0보다 커야 합니다")
        return value

    def create(self, validated_data):
        challenge_id = validated_data.pop("challenge_id")
        user_id = validated_data.pop("user_id")

        # 무슨 의미인지 모르겠어서 사용 안 함
        # challenge = get_object_or_404(Challenge, id=challenge_id)
        # user = get_object_or_404(User, id=user_id)

        validated_data["payment_date"] = timezone.now().date()

        expense = Expense.objects.create(
            challenge_id=challenge_id, user_id=user_id, **validated_data
        )
        return expense


class SimpleExpenseCreateSerializer(serializers.ModelSerializer):
    amount = serializers.IntegerField()

    class Meta:
        model = Expense
        fields = ["amount"]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("결제 금액은 0보다 커야 합니다")
        return value

    def create(self, validated_data):
        challenge = self.context.get("challenge")
        user = self.context.get("user")

        # Challenge의 카테고리를 store 필드에 저장
        category_map = {
            1: "카페/디저트",
            2: "외식",
            3: "장보기",
            4: "쇼핑",
            5: "문화생활",
            6: "취미/여가",
            7: "술/담배",
            8: "교통",
            9: "기타",
        }
        store = category_map.get(challenge.category, "기타")

        expense = Expense.objects.create(
            challenge=challenge,
            user=user,
            store=store,
            amount=validated_data["amount"],
            payment_date=timezone.now().date(),
            is_handwritten=True,
        )
        return expense
