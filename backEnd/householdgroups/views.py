from django.db import transaction
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound, ValidationError
from members.models import Member
from householdgroups.models import HouseHoldGroup
from .serializers import HouseHoldGroupSerializer, JoinHouseHoldGroupSerializer


# Create your views here.
class HouseHoldGroups(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = HouseHoldGroupSerializer(
            data=request.data,
        )

        if serializer.is_valid():
            with transaction.atomic():  # if anything goes wrong in the 'with' statement, every code is gonna be canceled without saving
                householdgroup = serializer.save()

                Member.objects.create(
                    user=request.user,
                    householdgroup=householdgroup,
                    role=Member.RoleChoice.OWNER,
                )  # When an householdgroup is created, a owner member of the group also created with the login data

            return Response(
                serializer.data,
                status=HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=HTTP_400_BAD_REQUEST,
        )


class JoinHouseHoldGroup(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = JoinHouseHoldGroupSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        # if the serializer is not validated, the exception will occur and send a error response with status code

        invite_code = serializer.validated_data["invite_code"]
        # fetch a code that user entered

        try:
            householdgroup = HouseHoldGroup.objects.get(
                invite_code=invite_code,
                is_active=True,
            )  # Find an activated object from DB with the code
        except HouseHoldGroup.DoesNotExist:
            raise NotFound("Invalid invitation code.")

        existing_member = Member.objects.filter(
            user=request.user,
            householdgroup=householdgroup,
        ).exists()
        # Check whether the user is already a member of the group or not

        if existing_member:
            raise ValidationError("You are already enrolled this group.")

        Member.objects.create(
            user=request.user,
            householdgroup=householdgroup,
            role=Member.RoleChoice.member,
        )
        # if the user is not a member of the group, create an Member object belong to the group as a member

        serializer = HouseHoldGroupSerializer(householdgroup)
        return Response(
            serializer.data,  # show where they are enrolled
            status=HTTP_201_CREATED,
        )
