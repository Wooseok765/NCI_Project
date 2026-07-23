from rest_framework import serializers
from .models import HouseHoldGroup


class HouseHoldGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = HouseHoldGroup
        fields = (
            "id",
            "title",
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


class JoinHouseHoldGroupSerializer(serializers.Serializer):
    # This serializer validates an invitation code when those who received it use it.
    invite_code = serializers.CharField(
        max_length=200,
    )
