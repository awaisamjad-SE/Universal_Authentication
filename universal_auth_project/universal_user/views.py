# -------------------------
# 2FA Login (new endpoint)
# -------------------------
from rest_framework.views import APIView
from rest_framework import permissions

class TwoFALoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        code = request.data.get("code")
        if not (email and password and code):
            return Response({"detail": "Email, password, and 2FA code are required."}, status=400)
        user = authenticate(email=email, password=password)
        if not user:
            return Response({"detail": "Invalid credentials"}, status=400)
        if not user.is_2fa_enabled:
            return Response({"detail": "2FA is not enabled for this user."}, status=400)
        if not user.totp_secret:
            return Response({"detail": "2FA not set up."}, status=400)
        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(code):
            return Response({"detail": "Invalid 2FA code."}, status=400)
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        })

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.contrib.auth import authenticate
from django.conf import settings
import pyotp
import random
from rest_framework.permissions import IsAuthenticated

from .models import User
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    SendOTPSerializer,
    OTPVerifySerializer,
    PasswordResetSerializer,
    PasswordResetConfirmSerializer,
    TwoFASetupSerializer,
    TwoFAVerifySerializer
)
from .utils import send_otp_email

class TwoFASetupView(generics.GenericAPIView):
    serializer_class = TwoFASetupSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.is_2fa_enabled:
            return Response({"detail": "2FA is already enabled."}, status=400)
        # Generate a new secret
        secret = pyotp.random_base32()
        user.totp_secret = secret
        user.save()
        # Generate provisioning URI for Google Authenticator
        app_name = getattr(settings, 'PROJECT_NAME', 'UniversalAuth')
        uri = pyotp.totp.TOTP(secret).provisioning_uri(name=user.email, issuer_name=app_name)
        return Response({"qr_code_url": uri, "secret": secret})

# -------------------------
# 2FA Verify (Enable)
# -------------------------
class TwoFAVerifyView(generics.GenericAPIView):
    serializer_class = TwoFAVerifySerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if not user.totp_secret:
            return Response({"detail": "2FA setup not started."}, status=400)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data["code"]
        totp = pyotp.TOTP(user.totp_secret)
        if totp.verify(code):
            user.is_2fa_enabled = True
            user.save()
            return Response({"detail": "2FA enabled successfully."})
        else:
            return Response({"detail": "Invalid 2FA code."}, status=400)
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.contrib.auth import authenticate
import random

from .models import User
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    SendOTPSerializer,
    OTPVerifySerializer,
    PasswordResetSerializer,
    PasswordResetConfirmSerializer,
    TwoFASetupSerializer,
    TwoFAVerifySerializer
)
from .utils import send_otp_email


# -------------------------
# Send OTP (Public)
# -------------------------
class SendOTPView(generics.GenericAPIView):
    serializer_class = SendOTPSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=404)

        otp = str(random.randint(100000, 999999))
        user.otp_code = otp
        user.otp_expiry = timezone.now() + timezone.timedelta(minutes=10)
        user.save()
        send_otp_email(user.email, otp)
        return Response({"detail": "OTP sent successfully"})


# -------------------------
# Verify OTP (Public)
# -------------------------
class VerifyOTPView(generics.GenericAPIView):
    serializer_class = OTPVerifySerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=404)

        if not user.otp_code or not user.otp_expiry:
            return Response({"detail": "No OTP generated"}, status=400)
        if timezone.now() > user.otp_expiry:
            return Response({"detail": "OTP expired"}, status=400)
        if user.otp_code != otp:
            return Response({"detail": "Invalid OTP"}, status=400)

        user.is_email_verified = True
        user.otp_code = None
        user.otp_expiry = None
        user.save()

        return Response({"detail": "OTP verified successfully"})


# -------------------------
# Register / Signup
# -------------------------
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate OTP for email verification
        otp = str(random.randint(100000, 999999))
        user.otp_code = otp
        user.otp_expiry = timezone.now() + timezone.timedelta(minutes=10)
        user.save()
        send_otp_email(user.email, otp)

        response_data = {
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "detail": "User created. Please verify your email using OTP."
        }
        return Response(response_data, status=201)


# -------------------------
# Login
# -------------------------

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        # If 2FA is enabled, do not issue tokens, just indicate 2FA is required
        if user.is_2fa_enabled:
            return Response({"detail": "2FA code required"}, status=200)

        # If 2FA is not enabled, issue tokens as normal
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        })


# -------------------------
# Logout
# -------------------------
class LogoutView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out"})
        except Exception:
            return Response({"detail": "Invalid token"}, status=400)


# -------------------------
# Profile
# -------------------------
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# -------------------------
# Password Reset
# -------------------------
class PasswordResetView(generics.GenericAPIView):
    serializer_class = PasswordResetSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        user = User.objects.get(email=email)
        otp = str(random.randint(100000, 999999))
        user.otp_code = otp
        user.otp_expiry = timezone.now() + timezone.timedelta(minutes=10)
        user.save()
        send_otp_email(user.email, otp)
        return Response({"detail": "OTP sent for password reset"})


class PasswordResetConfirmView(generics.GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        user.set_password(serializer.validated_data["new_password"])
        user.otp_code = None
        user.otp_expiry = None
        user.save()
        return Response({"detail": "Password reset successfully"})
