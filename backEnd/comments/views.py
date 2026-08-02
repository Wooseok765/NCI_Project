from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED
from rest_framework.views import APIView

from chorecards.models import ChoreCard
from comments.models import Comment
from comments.serializers import CommentSerializer
from members.models import Member


class Comments(APIView):
    permission_classes = [IsAuthenticated]

    def get_chorecard(self, chorecard_pk):
        try:
            return ChoreCard.objects.get(pk=chorecard_pk)
        except ChoreCard.DoesNotExist:
            raise NotFound("Chore card not found.")

    def get_member(self, request, chorecard):
        try:
            return Member.objects.get(
                user=request.user,
                householdgroup=chorecard.householdgroup,
            )
        except Member.DoesNotExist:
            raise PermissionDenied("You are not a member of this household group.")

    def get(self, request, chorecard_pk):
        chorecard = self.get_chorecard(chorecard_pk)

        self.get_member(request, chorecard)

        comments = Comment.objects.filter(
            choreCard=chorecard,
        ).order_by(
            "created_at",
        )

        serializer = CommentSerializer(
            comments,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request, chorecard_pk):
        chorecard = self.get_chorecard(chorecard_pk)

        member = self.get_member(
            request,
            chorecard,
        )

        serializer = CommentSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        serializer.save(
            writer=member,
            choreCard=chorecard,
        )

        return Response(
            serializer.data,
            status=HTTP_201_CREATED,
        )
