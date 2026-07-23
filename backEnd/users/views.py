from django.contrib.auth import authenticate, login, logout
from rest_framework.status import HTTP_201_CREATED, HTTP_400_BAD_REQUEST, HTTP_200_OK
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import SignUpSerializer, LogInSerializer, UserSerializer

# Create your views here.


class SignUp(APIView):

    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                serializer.data,
                status=HTTP_201_CREATED,
            )
        return Response(
            serializer.errors,
            status=HTTP_400_BAD_REQUEST,
        )


class Login(APIView):

    def post(self, request):
        serializer = LogInSerializer(data=request.data)

        if serializer.is_valid():
            username = serializer.validated_data.get("username")
            password = serializer.validated_data.get("password")

            user = authenticate(
                request=request,  # for extra data from client to backend just in case
                username=username,
                password=password,
            )  # If there a matched accout with the values, returns an object

            if user is not None:
                login(
                    request, user
                )  # the request here is necessary to save the login data in current session
                # After login, the session serial number is used intead of login data because of security issue
                return Response(
                    {"system": "Login successful."},
                    status=HTTP_200_OK,
                )

            return Response(
                {"system": "Invalid username or password"},
                status=HTTP_400_BAD_REQUEST,
            )  # It occurs when there are no matched account in the DB

        return Response(
            serializer.errors,
            status=HTTP_400_BAD_REQUEST,
        )


class Me(APIView):
    # Shows the information of current login user

    permission_classes = [IsAuthenticated]
    # check whether this user login now

    def get(self, request):
        serializer = UserSerializer(request.user)
        # Convert the current user(login) information convertible to JSON

        return Response(
            serializer.data,
            status=HTTP_200_OK,
        )


class LogOut(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        # This removes login data from the current session

        return Response(
            {"System": "Logout successful"},
            status=HTTP_200_OK,
        )
