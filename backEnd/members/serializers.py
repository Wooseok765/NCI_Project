from rest_framework import serializers
from members.models import Member


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = (
            "id",
            "username",
            "householdgroup",
            "role",
            "contribution",
            "penalty",
        )

    username = serializers.SerializerMethodField()

    def get_username(self, member):
        # 'member' came from view.py when this serializer class is called
        return member.user.username  # == Users.username
