from rest_framework import permissions
from challenges.models import ChallengeParticipant


class IsParticipant(permissions.BasePermission):
    def has_permission(self, request, view):
        # GET 요청은 통과 (목록 조회 등은 허용)
        if request.method in permissions.SAFE_METHODS:
            return True

        challenge_id = view.kwargs.get("challenge_id")
        return ChallengeParticipant.objects.filter(
            challenge_id=challenge_id, user=request.user
        ).exists()


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user
