from rest_framework.test import APITestCase
from users.models import User
from datetime import date
from householdgroups.models import HouseHoldGroup
from members.models import Member
from chorecards.models import ChoreCard

# Create your tests here.


class CompleteChoreCardTest(APITestCase):
    def setUp(self):

        self.password = "123123"
        self.user = User.objects.create(
            username="testUser",
            email="tent@test.com",
        )
        self.user.set_password(self.password)
        self.user.save()

        """ mock user for a test """

        self.householdgroup = HouseHoldGroup.objects.create(
            title="test group",
            description="test test",
        )

        self.member = Member.objects.create(
            user=self.user,
            householdgroup=self.householdgroup,
            role="owner",
            contribution=0,
            penalty=0,
        )
        """ register the mock user into a group as a member """

        self.chorecard = ChoreCard.objects.create(
            title="Test Chore Rard",
            householdgroup=self.householdgroup,
            checklist="1. Test, 2. Test",
            difficulty_weight=5,
            status="in_progress",
            due_date=date.today(),
        )

        self.chorecard.assignee.add(self.member)

        login_user = self.client.login(
            username=self.user.username,
            password=self.password,
        )

        self.assertTrue(login_user)
        """ it will return True if the login is successed """

    def test_complete_chorecard(self):
        url = f"/api/v1/chorecards/{self.chorecard.id}/complete/"

        response = self.client.patch(path=url)
        """ It will return the result of patch method (집안일 카드를 완료시키는 기능)"""

        changedChorecard = ChoreCard.objects.get(id=self.chorecard.id)

        changedMember = Member.objects.get(id=self.member.id)

        self.assertEqual(response.status_code, 200)
        """ check status of the returned object """

        self.assertEqual(
            changedChorecard.status,
            "completed",
        )

        self.assertIsNotNone(
            changedChorecard.completed_at,
        )

        self.assertEqual(
            changedMember.contribution,
            5,
        )

    def test_try_complete_twice(self):
        url = f"/api/v1/chorecards/{self.chorecard.id}/complete/"

        first_response = self.client.patch(path=url)
        second_response = self.client.patch(path=url)

        changedMember = Member.objects.get(id=self.member.id)

        self.assertEqual(
            second_response.status_code,
            400,
        )
        """ The status of second should be 400 to avoid duplicate the contribution point """

        self.assertEqual(
            changedMember.contribution,
            5,
        )
