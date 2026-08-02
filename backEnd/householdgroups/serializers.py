from rest_framework import serializers

from members.models import Member
from .models import HouseHoldGroup


class HouseHoldGroupSerializer(serializers.ModelSerializer):
    owner_username = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = HouseHoldGroup
        fields = (
            "id",
            "title",
            "owner_username",
            "is_owner",
            "description",
            "invite_code",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "invite_code",
        )

    def get_owner_username(self, householdgroup):
        owner = (
            Member.objects.filter(
                householdgroup=householdgroup,
                role=Member.RoleChoice.OWNER,
            )
            .select_related("user")
            .first()
        )
        """ .select_related("user"): Bring the related user object in the same query to avoid additional database queries when accessing the username. """

        if owner is None:
            return None

        return owner.user.username

    def get_is_owner(self, householdgroup):
        request = self.context.get("request")
        """ context: context is a dictionary that can be passed to the serializer when it is initialized. It can contain any data that you want to pass to the serializer, such as the request object, the current user, or any other data that you want to use in the serializer. 다시말해 브라우저에서 입력된 정보를 직접 받는게 아니라, context를 통해서 request를 받아오는 것임(직접 값을 받은 view에서 serializer로 서버 내부자거래 같은것)"""

        if request is None:
            return False

        return Member.objects.filter(
            user=request.user,
            householdgroup=householdgroup,
            role=Member.RoleChoice.OWNER,
        ).exists()


class JoinHouseHoldGroupSerializer(serializers.Serializer):
    # This serializer validates an invitation code when those who received it use it.
    invite_code = serializers.CharField(
        max_length=200,
    )
