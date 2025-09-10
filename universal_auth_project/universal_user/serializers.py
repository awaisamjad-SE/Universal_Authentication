# universal_user/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

# -----------------------
# User Serializer
# -----------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "is_email_verified",
            "is_2fa_enabled",
        ]


# -----------------------
# Register Serializer
# -----------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["email", "username", "first_name", "last_name", "password"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


# -----------------------
# Login Serializer
# -----------------------
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data["email"], password=data["password"])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        data["user"] = user
        return data


# -----------------------
# OTP Serializer
# -----------------------
class OTPSerializer(serializers.Serializer):
    otp = serializers.CharField(max_length=6)
