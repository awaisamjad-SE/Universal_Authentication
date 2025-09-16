# -----------------------
# 2FA Serializers
# -----------------------
from rest_framework import serializers
import pyotp
from django.contrib.auth import authenticate
from django.utils import timezone

class TwoFASetupSerializer(serializers.Serializer):
    # No input needed, just for output
    qr_code_url = serializers.CharField(read_only=True)
    secret = serializers.CharField(read_only=True)

class TwoFAVerifySerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6)

    def validate_code(self, value):
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("Code must be a 6-digit number.")
        return value
import random
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
        read_only_fields = ["id", "email", "is_email_verified", "is_2fa_enabled"]

    def validate_username(self, value):
        user = self.instance
        if user and user.username != value:
            if User.objects.filter(username=value).exclude(pk=user.pk).exists():
                raise serializers.ValidationError("This username is already taken.")
        return value


# -----------------------
# Register Serializer
# -----------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["email", "username", "first_name", "last_name", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        user.is_email_verified = False
        user.save()
        return user


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
        if not user.is_email_verified:
            raise serializers.ValidationError("Email not verified. Please verify first.")
        data["user"] = user
        return data


# -----------------------
# Send OTP Serializer
# -----------------------
class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()


# -----------------------
# OTP Verify Serializer
# -----------------------
class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

    def validate_otp(self, value):
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("OTP must be a 6-digit number.")
        return value


# -----------------------
# Password Reset Serializers
# -----------------------
class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        try:
            user = User.objects.get(email=data["email"])
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")

        if not user.otp_code or timezone.now() > user.otp_expiry:
            raise serializers.ValidationError("OTP expired. Request a new one.")
        if user.otp_code != data["otp"]:
            raise serializers.ValidationError("Invalid OTP.")

        data["user"] = user
        return data
