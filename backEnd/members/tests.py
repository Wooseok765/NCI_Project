from rest_framework.test import APITestCase

from householdgroups.models import HouseHoldGroup
from members.models import Member
from users.models import User


class MemberAPITest(APITestCase):

    def setUp(self):

        self.password = "1q2w3e4r1!"

        # 테스트 대상 그룹의 기존 owner 사용자
        self.owner_user = User.objects.create(
            username="ownerUser",
            email="owner@test.com",
        )
        self.owner_user.set_password(self.password)
        self.owner_user.save()

        # 테스트 대상 그룹의 기존 일반 member 사용자
        self.member_user = User.objects.create(
            username="memberUser",
            email="member@test.com",
        )
        self.member_user.set_password(self.password)
        self.member_user.save()

        # 테스트 대상 그룹에 속하지 않은 사용자
        self.outside_user = User.objects.create(
            username="outsideUser",
            email="outside@test.com",
        )
        self.outside_user.set_password(self.password)
        self.outside_user.save()

        self.householdgroup = HouseHoldGroup.objects.create(
            title="Test Group",
            description="Group used for the member API test",
        )

        self.other_householdgroup = HouseHoldGroup.objects.create(
            title="Other Group",
            description="A different group that must not be included",
        )

        self.owner_member = Member.objects.create(
            user=self.owner_user,
            householdgroup=self.householdgroup,
            role=Member.RoleChoice.OWNER,
            contribution=10,
            penalty=0,
        )

        self.member = Member.objects.create(
            user=self.member_user,
            householdgroup=self.householdgroup,
            role=Member.RoleChoice.MEMBER,
            contribution=5,
            penalty=1,
        )

        # outsideUser는 로그인 사용자이지만 테스트 대상이 아닌 다른 그룹에만 소속됨
        self.outside_member = Member.objects.create(
            user=self.outside_user,
            householdgroup=self.other_householdgroup,
            role=Member.RoleChoice.MEMBER,
        )

    def test_group_member_can_get_members(self):

        # 일반 memberUser로 로그인하여 sessionid를 생성
        login_data = {
            "username": self.member_user.username,
            "password": self.password,
        }

        login_response = self.client.post(
            path="/api/v1/users/login/",
            data=login_data,
            format="json",
        )

        self.assertEqual(
            login_response.status_code,
            200,
            login_response.data,
        )

        # 로그인된 같은 client로 현재 그룹의 구성원 목록 요청
        response = self.client.get(
            path=f"/api/v1/members/{self.householdgroup.id}/",
        )

        self.assertEqual(
            response.status_code,
            200,
            response.data,
        )

        # 다른 그룹의 outsideMember는 제외되고 현재 그룹의 두 명만 있어야 함
        self.assertEqual(
            len(response.data),
            2,
        )

        # owner Member의 DB 값이 API 응답에 정확히 포함됐는지 검사
        self.assertIn(
            {
                "id": self.owner_member.id,
                "username": self.owner_user.username,
                "householdgroup": self.householdgroup.id,
                "role": Member.RoleChoice.OWNER,
                "contribution": 10,
                "penalty": 0,
            },
            response.data,
        )

        # 일반 Member의 DB 값이 API 응답에 정확히 포함됐는지 검사
        self.assertIn(
            {
                "id": self.member.id,
                "username": self.member_user.username,
                "householdgroup": self.householdgroup.id,
                "role": Member.RoleChoice.MEMBER,
                "contribution": 5,
                "penalty": 1,
            },
            response.data,
        )

    def test_get_members_without_login(self):

        # 로그인하지 않은 client로 구성원 목록 요청
        response = self.client.get(
            path=f"/api/v1/members/{self.householdgroup.id}/",
        )

        self.assertEqual(
            response.status_code,
            403,
            response.data,
        )

    def test_outside_user_cannot_get_members(self):

        # 그룹에 속하지 않은 outsideUser로 로그인
        login_data = {
            "username": self.outside_user.username,
            "password": self.password,
        }

        login_response = self.client.post(
            path="/api/v1/users/login/",
            data=login_data,
            format="json",
        )

        self.assertEqual(
            login_response.status_code,
            200,
            login_response.data,
        )

        # 로그인했더라도 해당 그룹의 Member가 아니므로 접근할 수 없어야 함
        response = self.client.get(
            path=f"/api/v1/members/{self.householdgroup.id}/",
        )

        self.assertEqual(
            response.status_code,
            403,
            response.data,
        )

        self.assertEqual(
            response.data["detail"],
            "You are not a member of this household group.",
        )
