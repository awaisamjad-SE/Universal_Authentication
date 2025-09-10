from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.contrib.auth import authenticate
import random

from .models import User
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .utils import send_otp_email


# -------------------------
# Register / Signup
# -------------------------
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        # Optional: send OTP to verify email
        otp = str(random.randint(100000, 999999))
        user.otp_code = otp
        user.otp_expiry = timezone.now() + timezone.timedelta(minutes=10)
        user.save()
        send_otp_email(user.email, otp)


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

        # Check email verified
        if not user.is_email_verified:
            return Response({"detail": "Email not verified"}, status=400)

        # JWT token
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
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()  # Requires simplejwt blacklist app
            return Response({"detail": "Successfully logged out"})
        except Exception as e:
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
# Send OTP
# -------------------------
class SendOTPView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        otp = str(random.randint(100000, 999999))
        user.otp_code = otp
        user.otp_expiry = timezone.now() + timezone.timedelta(minutes=10)
        user.save()
        send_otp_email(user.email, otp)
        return Response({"detail": "OTP sent to email"})


# -------------------------
# Verify OTP
# -------------------------
class VerifyOTPView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        otp = request.data.get("otp")
        user = request.user

        if not user.otp_code or not user.otp_expiry:
            return Response({"detail": "No OTP generated"}, status=400)
        if timezone.now() > user.otp_expiry:
            return Response({"detail": "OTP expired"}, status=400)
        if otp != user.otp_code:
            return Response({"detail": "Invalid OTP"}, status=400)

        # OTP verified
        user.is_email_verified = True
        user.otp_code = None
        user.otp_expiry = None
        user.save()
        return Response({"detail": "OTP verified successfully"})


# -------------------------
# Password Reset (Optional)
# -------------------------
class PasswordResetView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email required"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=404)

        otp = str(random.randint(100000, 999999))
        user.otp_code = otp
        user.otp_expiry = timezone.now() + timezone.timedelta(minutes=10)
        user.save()
        send_otp_email(user.email, otp)
        return Response({"detail": "OTP sent for password reset"})


class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        new_password = request.data.get("new_password")

        if not all([email, otp, new_password]):
            return Response({"detail": "Email, OTP, and new password are required"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=404)

        if user.otp_code != otp or timezone.now() > user.otp_expiry:
            return Response({"detail": "Invalid or expired OTP"}, status=400)

        user.set_password(new_password)
        user.otp_code = None
        user.otp_expiry = None
        user.save()
        return Response({"detail": "Password reset successfully"})
