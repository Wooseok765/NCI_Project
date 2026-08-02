from rest_framework import serializers
from comments.models import Comment


class CommentSerializer(serializers.ModelSerializer):
    writer_username = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = (
            "id",
            "writer",
            "writer_username",
            "choreCard",
            "payload",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "writer",
            "choreCard",
            "created_at",
            "updated_at",
        )

    def get_writer_username(self, comment):
        return comment.writer.user.username
