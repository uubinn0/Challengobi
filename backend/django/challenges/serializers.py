from rest_framework import serializers
from .models import (
    Challenge,
    ChallengeParticipant,
    Expense,
    ChallengeLike,
    ChallengeInvite,
    OCRResult,
    DraftExpense,
)


class ChallengeListSerializer(serializers.ModelSerializer):
    participant_count = serializers.SerializerMethodField()
    is_participating = serializers.SerializerMethodField()
    creator_nickname = serializers.CharField(source="creator.nickname", read_only=True)

    class Meta:
        model = Challenge
        fields = [
            "id",
            "creator",
            "creator_nickname",
            "category",
            "title",
            "start_date",
            "duration",
            "budget",
            "status",
            "participant_count",
            "is_participating",
        ]

    def get_participant_count(self, obj):
        return obj.challengeparticipant_set.count()

    def get_is_participating(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.challengeparticipant_set.filter(user=request.user).exists()
        return False


class ChallengeDetailSerializer(serializers.ModelSerializer):
    participants = serializers.SerializerMethodField()
    reactions = serializers.SerializerMethodField()
    my_reaction = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = "__all__"
        read_only_fields = ["creator", "progress_rate"]

    def get_participants(self, obj):
        return ChallengeParticipantSerializer(
            obj.challengeparticipant_set.all(), many=True
        ).data

    def get_reactions(self, obj):
        return {
            "encourage_count": obj.challengelike_set.filter(
                reaction_type="encourage"
            ).count(),
            "want_count": obj.challengelike_set.filter(reaction_type="want").count(),
        }

    def get_my_reaction(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            reaction = obj.challengelike_set.filter(user=request.user).first()
            return reaction.reaction_type if reaction else None
        return None


class ChallengeParticipantSerializer(serializers.ModelSerializer):
    user_nickname = serializers.CharField(source="user.nickname", read_only=True)
    expense_count = serializers.SerializerMethodField()

    class Meta:
        model = ChallengeParticipant
        fields = [
            "id",
            "user",
            "user_nickname",
            "initial_budget",
            "balance",
            "is_failed",
            "joined_at",
            "expense_count",
        ]
        read_only_fields = ["balance", "is_failed"]

    def get_expense_count(self, obj):
        return obj.expense_set.count()


class ExpenseSerializer(serializers.ModelSerializer):
    receipt_image = serializers.ImageField(required=False)

    class Meta:
        model = Expense
        fields = "__all__"
        read_only_fields = ["user", "created_at"]


class OCRResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = OCRResult
        fields = ["id", "image", "result_data", "status", "created_at", "completed_at"]
        read_only_fields = ["result_data", "status", "completed_at"]


class DraftExpenseSerializer(serializers.ModelSerializer):
    ocr_result_data = serializers.SerializerMethodField()

    class Meta:
        model = DraftExpense
        fields = "__all__"
        read_only_fields = ["user", "created_at", "modified_at"]

    def get_ocr_result_data(self, obj):
        if obj.ocr_result:
            return OCRResultSerializer(obj.ocr_result).data
        return None


class ChallengeLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeLike
        fields = ["id", "challenge", "user", "reaction_type", "created_at"]
        read_only_fields = ["user", "created_at"]


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
            "from_user",
            "from_user_nickname",
            "challenge_title",
            "status",
            "created_at",
        ]
        read_only_fields = ["from_user", "created_at"]
