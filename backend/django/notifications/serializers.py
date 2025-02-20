from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    type_display = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "user",
            "type",
            "type_display",
            "reference_id",
            "content",
            "is_read",
            "created_at",
        ]
        read_only_fields = ["id", "user", "type_display", "created_at"]

    def get_type_display(self, obj): # type_display의 한글 라벨 가져오기
        return obj.get_type_display()

    def create(self, validated_data):
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["user"] = request.user
        return super().create(validated_data)


class NotificationReadSerializer(serializers.ModelSerializer):
    '''
    알림 읽음 상태 변경
    '''
    class Meta:
        model = Notification
        fields = ["is_read"]
