from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from members.models import Member
from members.serializers import MemberSerializer


# Create your views here.
class HouseholdGroupMembers(APIView):
    permission_classes = [IsAuthenticated]

    def is_member(self, user, pk):
        # Check if this user is one of members of the group
        return Member.objects.filter(user=user, householdgroup_id=pk).exists()

    def get_members(self, pk):
        return Member.objects.filter(householdgroup_id=pk)

    def get(self, request, householdgroup_pk):

        is_member = self.is_member(request.user, householdgroup_pk)

        if not is_member:
            raise PermissionDenied("You are not a member of this household group.")

        members = self.get_members(
            householdgroup_pk
        )  # fetched all members from the group

        serializer = MemberSerializer(
            members,
            many=True,
        )

        return Response(serializer.data, status=HTTP_200_OK)
