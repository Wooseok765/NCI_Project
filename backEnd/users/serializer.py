from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import User


class SignUpSerializer(serializers.ModelSerializer):
    class Meta:  # Notice which model and the model's fields need
        model = User
        fields = (
            "username",
            "email",
            "password",
        )  # Serialize and show only this fields when this serializer class called from views.py. These fields are default

    email = serializers.EmailField(
        required=True,
    )  # Change default field's fieldOption

    password = serializers.CharField(
        write_only=True,  # It's not gonna be included in API response
        validators=[validate_password],
        # validate the password with Django's stadard
    )

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
        # activate when .save() in views.py is called
        # create an User object and save in the data base with validated data
        # fill the columns according to the data that user wrote
        # An account created by this class is general user account(is_satff=false, is_superuser=false, is_avtive=false)
        # Admin account should be created by terminal


class LogInSerializer(serializers.Serializer):
    # This class get and validate data which are fetched from DB
    # So, no need Meta class
    username = serializers.CharField(
        required=True,
    )

    password = serializers.CharField(
        required=True,
        write_only=True,
        trim_whitespace=False,
        # remove the whitespace front and back of the password
    )


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
        )

        read_only_fields = (
            "id",
            "username",
            "email",
        )
