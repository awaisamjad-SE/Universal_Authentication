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


class TwoFAToggleSerializer(serializers.Serializer):
    """Serializer for enabling/disabling 2FA"""
    action = serializers.ChoiceField(choices=[('enable', 'Enable'), ('disable', 'Disable')])
    code = serializers.CharField(max_length=6, required=False)
    
    def validate_code(self, value):
        if value and (not value.isdigit() or len(value) != 6):
            raise serializers.ValidationError("Code must be a 6-digit number.")
        return value

    def validate(self, data):
        action = data.get('action')
        code = data.get('code')
        
        # For disable action, always require 2FA code for security
        if action == 'disable' and not code:
            raise serializers.ValidationError("2FA code is required to disable 2FA.")
            
        return data


class TwoFARecoveryLoginSerializer(serializers.Serializer):
    """Serializer for login using backup recovery codes"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    recovery_code = serializers.CharField(max_length=8)

    def validate_recovery_code(self, value):
        if not value.isalnum() or len(value) != 8:
            raise serializers.ValidationError("Recovery code must be 8 alphanumeric characters.")
        return value.upper()


class TwoFARecoveryRequestSerializer(serializers.Serializer):
    """Serializer for requesting 2FA recovery options"""
    email = serializers.EmailField()
    
    def validate_email(self, value):
        try:
            from .models import User
            user = User.objects.get(email=value)
            if not user.is_2fa_enabled:
                raise serializers.ValidationError("2FA is not enabled for this account.")
        except User.DoesNotExist:
            raise serializers.ValidationError("Account not found.")
        return value


class TwoFARecoveryDisableSerializer(serializers.Serializer):
    """Serializer for disabling 2FA using email verification"""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    confirm_disable = serializers.BooleanField()

    def validate_otp(self, value):
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError("OTP must be a 6-digit number.")
        return value

    def validate_confirm_disable(self, value):
        if not value:
            raise serializers.ValidationError("You must confirm that you want to disable 2FA.")
        return value


class BackupCodesSerializer(serializers.Serializer):
    """Serializer for backup codes response"""
    backup_codes = serializers.ListField(
        child=serializers.CharField(max_length=8),
        read_only=True
    )
    message = serializers.CharField(read_only=True)
