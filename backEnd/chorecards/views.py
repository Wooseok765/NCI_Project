from django.utils import timezone
from django.db import transaction
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound, ParseError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_200_OK, HTTP_204_NO_CONTENT
from members.models import Member
from .serializers import (
    ChoreCardListSerializer,
    CreateChoreCardSerializer,
    ChoreCardSerializer,
    UpdateChoreCardSerializer,
)
from .models import ChoreCard


# Create your views here.
class ChoreCards(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateChoreCardSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        householdgroup = serializer.validated_data["householdgroup"]

        is_owner = Member.objects.filter(
            user=request.user,
            householdgroup=householdgroup,
            role=Member.RoleChoice.OWNER,
        ).exists()

        if not is_owner:
            raise PermissionDenied(
                {"System": "Only the group owner can create a chore card"},
            )

        chorecard = serializer.save()
        response_serializer = ChoreCardSerializer(chorecard)

        return Response(
            response_serializer.data,
            status=HTTP_201_CREATED,
        )

    def get(self, request):
        selected_householdgroup_id = request.query_params.get("householdgroup")

        if selected_householdgroup_id is not None:
            try:
                selected_householdgroup_id = int(
                    selected_householdgroup_id,
                )
            except ValueError:
                raise ParseError(
                    {
                        "System": (
                            "The household group ID " "must be a positive integer."
                        )
                    }
                )

            if selected_householdgroup_id <= 0:
                raise ParseError(
                    {
                        "System": (
                            "The household group ID " "must be a positive integer."
                        )
                    }
                )

            is_member = Member.objects.filter(
                user=request.user,
                householdgroup_id=selected_householdgroup_id,
            ).exists()

            if not is_member:
                raise PermissionDenied(
                    {"System": ("You are not a member of " "this household group.")}
                )

            chorecards = ChoreCard.objects.filter(
                householdgroup_id=selected_householdgroup_id,
            ).order_by(
                "created_at",
            )

            serializer = ChoreCardListSerializer(
                chorecards,
                many=True,
            )

            return Response(
                serializer.data,
                status=HTTP_200_OK,
            )

        householdgroup_ids = Member.objects.filter(
            user=request.user,
        ).values_list(
            "householdgroup_id",
            flat=True,
        )

        chorecards = ChoreCard.objects.filter(
            householdgroup_id__in=householdgroup_ids,
        ).order_by(
            "created_at",
        )

        serializer = ChoreCardListSerializer(
            chorecards,
            many=True,
        )

        return Response(
            serializer.data,
            status=HTTP_200_OK,
        )


class ChoreCardDetail(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        try:
            chorecard = ChoreCard.objects.get(pk=pk)
        except ChoreCard.DoesNotExist:
            raise NotFound

        is_member = Member.objects.filter(
            user=request.user,
            householdgroup=chorecard.householdgroup,
        ).exists()
        if not is_member:
            raise PermissionDenied(
                {"System": "You are not a member of this household group."}
            )
        # Check if the user is a member of the group to avoid fetch wrong chorecard that belong to other group

        return chorecard

    def check_owner(self, request, chorecard):

        is_owner = Member.objects.filter(
            user=request.user,
            householdgroup=chorecard.householdgroup,
            role=Member.RoleChoice.OWNER,
        ).exists()
        # check if the user is an owner of the group of the card

        if not is_owner:
            raise PermissionDenied(
                {"System": "Only the group owner can update or delete this chore card."}
            )

    def get(self, request, pk):
        chorecard = self.get_object(request, pk)

        serializer = ChoreCardSerializer(chorecard)

        return Response(
            serializer.data,
            status=HTTP_200_OK,
        )

    def patch(self, request, pk):
        chorecard = self.get_object(request, pk)

        self.check_owner(request, chorecard)

        serializer = UpdateChoreCardSerializer(
            chorecard,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        updated_chorecard = serializer.save()

        response_serializer = ChoreCardSerializer(
            updated_chorecard,
        )

        return Response(
            response_serializer.data,
            status=HTTP_200_OK,
        )

    def delete(self, request, pk):
        chorecard = self.get_object(request, pk)

        self.check_owner(request, chorecard)

        chorecard.delete()

        return Response(
            f"{chorecard} is deleted",
            status=HTTP_200_OK,
        )


class ChoreCardComplete(APIView):

    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        try:
            chorecard = ChoreCard.objects.get(pk=pk)
        except ChoreCard.DoesNotExist:
            raise NotFound

        is_member = Member.objects.filter(
            user=request.user,
            householdgroup=chorecard.householdgroup,
        ).exists()
        if not is_member:
            raise PermissionDenied(
                {"System": "You are not a member of this household group."}
            )

        return chorecard

    def is_assignee(self, request, chorecard):

        is_assignee = chorecard.assignee.filter(
            user=request.user,  # checking if this user is enlisted on the given chorecard.assignee(chorecard.assignee = member.user)
        ).exists()

        is_owner = (
            Member.objects.filter(  # checking if this user is an owner of the group
                user=request.user,
                householdgroup=chorecard.householdgroup,
                role=Member.RoleChoice.OWNER,
            ).exists()
        )

        if not is_assignee and not is_owner:
            raise PermissionDenied(
                {
                    "System": "Only the assignee owner or the group owner can change the status of chore card."
                }
            )

    def patch(self, request, pk):
        chorecard = self.get_object(request, pk)
        self.is_assignee(request, chorecard)

        if chorecard.status == ChoreCard.StatusChoice.COMPLETED:
            raise ParseError({"System": "This chore card is already completed."})

        with transaction.atomic():
            chorecard.status = ChoreCard.StatusChoice.COMPLETED
            chorecard.completed_at = timezone.now()
            chorecard.save()

            for assignee in chorecard.assignee.all():
                # chorecard.assignee.all() == [Member(id=00), Member(id=00)]
                assignee.contribution += chorecard.difficulty_weight
                assignee.save()  # Save the contribution point on the Member DB based if they finished the task

        serializer = ChoreCardSerializer(chorecard)

        return Response(
            serializer.data,
            status=HTTP_200_OK,
        )
