from rest_framework.test import APITestCase

from users.models import User


class UserAPITest(APITestCase):

    def setUp(self):

        self.password = "1q2w3e4r1!"

        self.user = User.objects.create(
            username="newUser",
            email="test@test.com",
        )
        self.user.set_password(self.password)
        self.user.save()

    def test_signup(self):  # setup과 상관없이 새로 회원가입하는것(유저네임 겹치면 안됨)

        signup_data = {
            "username": "signUpUser",
            "email": "test@test.com",
            "password": "signup1q2w!",
        }

        response = self.client.post(
            path="/api/v1/users/signup/",
            data=signup_data,
            format="json",
        )
        print("test result", response.status_code)
        print("test result", response.data)

        self.assertEqual(
            response.status_code,
            201,
        )

        # 회원가입 API가 생성한 signUpUser를 DB에서 다시 조회
        created_user = User.objects.get(
            username="signUpUser",
        )

        # created_user(이번에 생성한 계정의 해시값과 매개변수를 동일한 방법으로 해시화 한 후 동일한 값인지 비교)
        self.assertTrue(
            created_user.check_password("signup1q2w!"),
        )

    def test_login(self):

        login_data = {
            "username": self.user.username,
            # "email": "test@test.com", 로그인 serializer에서는 email이 reqired가 아님
            "password": self.password,
        }

        response = self.client.post(
            path="/api/v1/users/login/",
            data=login_data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.data["system"],
            "Login successful.",
        )

        self.assertIn(
            "csrf_token",
            response.data,
        )

        me_response = self.client.get(
            path="/api/v1/users/me/",
        )

        self.assertEqual(
            me_response.status_code,
            200,
        )

        self.assertEqual(
            me_response.data["username"],
            "newUser",
        )

    def test_login_with_wrong_password(self):

        # 틀린 비밀번호를 포함한 로그인 데이터
        login_data = {
            "username": self.user.username,
            # "email": "test@test.com", 로그인 serializer에서는 email이 reqired가 아님
            "password": "wrongPassword",
        }

        response = self.client.post(
            path="/api/v1/users/login/",
            data=login_data,
            format="json",
        )

        # 잘못된 로그인 요청은 400이어야 함
        self.assertEqual(
            response.status_code,
            400,
        )

        self.assertEqual(
            response.data["system"],
            "Invalid username or password",
        )

    def test_me_without_login(self):

        # 로그인하지 않은 상태로 내 정보 요청
        response = self.client.get(
            path="/api/v1/users/me/",
        )

        # 로그인하지 않았으므로 접근이 거부되어야 함
        self.assertEqual(
            response.status_code,
            403,
        )

    def test_logout(self):

        login_data = {
            "username": self.user.username,
            # "email": "test@test.com", fhrm serializer에서는 email이 reqired가 아님
            "password": self.password,
        }

        # 먼저 실제 로그인 API 실행
        login_response = self.client.post(
            path="/api/v1/users/login/",
            data=login_data,
            format="json",
        )

        self.assertEqual(
            login_response.status_code,
            200,
        )

        # 로그인된 같은 client로 로그아웃 요청
        logout_response = self.client.post(
            path="/api/v1/users/logout/",
        )

        self.assertEqual(
            logout_response.status_code,
            200,
        )

        self.assertEqual(
            logout_response.data["system"],
            "Logout successful",
        )

        # 로그아웃 후 다시 내 정보 요청
        me_response = self.client.get(
            path="/api/v1/users/me/",
        )

        # 세션이 삭제됐으므로 접근이 거부되어야 함
        self.assertEqual(
            me_response.status_code,
            403,
        )
