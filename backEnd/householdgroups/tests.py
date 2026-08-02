from rest_framework.test import APITestCase

from householdgroups.models import HouseHoldGroup
from members.models import Member
from users.models import User


class HouseHoldGroupAPITest(APITestCase):

    def setUp(self):

        self.password = "1q2w3e4r1!"

        # 그룹을 생성할 기존 사용자
        self.owner_user = User.objects.create(
            username="ownerUser",
            email="owner@test.com",
        )
        self.owner_user.set_password(self.password)
        self.owner_user.save()

        # 초대 코드를 사용해 그룹에 가입할 기존 사용자
        self.member_user = User.objects.create(
            username="memberUser",
            email="member@test.com",
        )
        self.member_user.set_password(self.password)
        self.member_user.save()

    def test_create_householdgroup(self):

        # 먼저 ownerUser로 로그인하여 sessionid를 생성
        login_data = {
            "username": self.owner_user.username,
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

        # 그룹 생성 화면에서 입력한 데이터를 흉내 냄
        householdgroup_data = {
            "title": "Test Group",
            "description": "Group created during the API test",
        }

        # 로그인된 같은 client로 그룹 생성 API 요청
        response = self.client.post(
            path="/api/v1/householdgroups/",
            data=householdgroup_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            201,
            response.data,
        )

        # 그룹 생성 API가 실제로 저장한 그룹을 DB에서 다시 조회
        created_householdgroup = HouseHoldGroup.objects.get(
            id=response.data["id"],
        )

        self.assertEqual(
            created_householdgroup.title,
            "Test Group",
        )

        self.assertEqual(
            created_householdgroup.description,
            "Group created during the API test",
        )

        # 자동 생성된 초대 코드가 API 응답에도 동일하게 들어 있는지 검사
        self.assertEqual(
            response.data["invite_code"],
            created_householdgroup.invite_code,
        )

        # 그룹 생성자와 연결된 owner Member 객체를 DB에서 조회
        created_owner_member = Member.objects.get(
            user=self.owner_user,
            householdgroup=created_householdgroup,
        )

        self.assertEqual(
            created_owner_member.role,
            Member.RoleChoice.OWNER,
        )

    def test_create_householdgroup_without_login(self):

        householdgroup_data = {
            "title": "Unauthorized Group",
            "description": "This group must not be created",
        }

        # 로그인하지 않은 client로 그룹 생성 요청
        response = self.client.post(
            path="/api/v1/householdgroups/",
            data=householdgroup_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            403,
            response.data,
        )

        # 접근이 거부됐으므로 DB에도 그룹이 없어야 함
        self.assertFalse(
            HouseHoldGroup.objects.filter(
                title="Unauthorized Group",
            ).exists(),
        )

    def test_join_householdgroup(self):

        # 가입 기능만 검사하기 위해 가입 대상 그룹을 DB에 미리 준비
        householdgroup = HouseHoldGroup.objects.create(
            title="Group To Join",
            description="Existing group for join test",
        )

        Member.objects.create(
            user=self.owner_user,
            householdgroup=householdgroup,
            role=Member.RoleChoice.OWNER,
        )

        # memberUser로 로그인하여 sessionid를 생성
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

        join_data = {
            "invite_code": householdgroup.invite_code,
        }

        # 로그인된 같은 client로 가입 API 요청
        response = self.client.post(
            path="/api/v1/householdgroups/join/",
            data=join_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            201,
            response.data,
        )

        self.assertEqual(
            response.data["id"],
            householdgroup.id,
        )

        # 가입 API가 생성한 memberUser의 Member 객체를 DB에서 조회
        joined_member = Member.objects.get(
            user=self.member_user,
            householdgroup=householdgroup,
        )

        self.assertEqual(
            joined_member.role,
            Member.RoleChoice.MEMBER,
        )

    def test_join_with_invalid_invite_code(self):

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

        response = self.client.post(
            path="/api/v1/householdgroups/join/",
            data={
                "invite_code": "wrong-code",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            404,
            response.data,
        )

        self.assertEqual(
            response.data["detail"],
            "Invalid invitation code.",
        )

    def test_join_householdgroup_without_login(self):

        householdgroup = HouseHoldGroup.objects.create(
            title="Unauthorized Join Test Group",
        )

        Member.objects.create(
            user=self.owner_user,
            householdgroup=householdgroup,
            role=Member.RoleChoice.OWNER,
        )

        # 로그인하지 않은 client로 가입 요청
        response = self.client.post(
            path="/api/v1/householdgroups/join/",
            data={
                "invite_code": householdgroup.invite_code,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            403,
            response.data,
        )

        # 접근이 거부됐으므로 memberUser의 Member 객체는 없어야 함
        self.assertFalse(
            Member.objects.filter(
                user=self.member_user,
                householdgroup=householdgroup,
            ).exists(),
        )

    def test_join_same_householdgroup_twice(self):

        householdgroup = HouseHoldGroup.objects.create(
            title="Duplicate Join Test Group",
        )

        Member.objects.create(
            user=self.owner_user,
            householdgroup=householdgroup,
            role=Member.RoleChoice.OWNER,
        )

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

        join_data = {
            "invite_code": householdgroup.invite_code,
        }

        # 첫 번째 가입 요청은 성공해야 함
        first_response = self.client.post(
            path="/api/v1/householdgroups/join/",
            data=join_data,
            format="json",
        )

        self.assertEqual(
            first_response.status_code,
            201,
            first_response.data,
        )

        # 같은 사용자가 같은 그룹에 두 번째로 가입 요청
        second_response = self.client.post(
            path="/api/v1/householdgroups/join/",
            data=join_data,
            format="json",
        )

        self.assertEqual(
            second_response.status_code,
            400,
            second_response.data,
        )

        self.assertEqual(
            second_response.data[0],
            "You are already enrolled this group.",
        )

        # 중복 요청 후에도 해당 사용자와 그룹의 Member 객체는 하나뿐이어야 함
        self.assertEqual(
            Member.objects.filter(
                user=self.member_user,
                householdgroup=householdgroup,
            ).count(),
            1,
        )
