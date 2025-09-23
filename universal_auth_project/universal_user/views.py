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
from django.core.mail import send_mail
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
    TwoFAVerifySerializer,
    TwoFAToggleSerializer,
    TwoFARecoveryLoginSerializer,
    TwoFARecoveryRequestSerializer,
    TwoFARecoveryDisableSerializer,
    BackupCodesSerializer
)
from .utils import send_otp_email, generate_backup_codes, send_recovery_email, send_recovery_notification

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
            
            # Automatically generate backup codes when 2FA is first enabled
            if not user.backup_codes:  # Only generate if no existing codes
                backup_codes = generate_backup_codes()
                user.backup_codes = backup_codes
                user.save()
                
                # Send backup codes to user's email
                send_recovery_email(user.email, backup_codes)
                
                return Response({
                    "detail": "2FA enabled successfully.",
                    "backup_codes": backup_codes,
                    "message": "Backup recovery codes have been generated and sent to your email. Please save them securely!"
                })
            else:
                user.save()
                return Response({"detail": "2FA enabled successfully."})
        else:
            return Response({"detail": "Invalid 2FA code."}, status=400)


# -------------------------
# 2FA Toggle (Enable/Disable)
# -------------------------
class TwoFAToggleView(generics.GenericAPIView):
    serializer_class = TwoFAToggleSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        action = serializer.validated_data['action']
        code = serializer.validated_data.get('code')
        
        if action == 'enable':
            # Enable 2FA - similar to TwoFAVerifyView but more flexible
            if user.is_2fa_enabled:
                return Response({"detail": "2FA is already enabled."}, status=400)
            if not user.totp_secret:
                return Response({"detail": "2FA setup not started. Please setup 2FA first."}, status=400)
            if not code:
                return Response({"detail": "2FA code is required to enable 2FA."}, status=400)
                
            totp = pyotp.TOTP(user.totp_secret)
            if totp.verify(code):
                user.is_2fa_enabled = True
                user.save()
                return Response({
                    "detail": "2FA enabled successfully.",
                    "is_2fa_enabled": True
                })
            else:
                return Response({"detail": "Invalid 2FA code."}, status=400)
                
        elif action == 'disable':
            # Disable 2FA - requires current 2FA code for security
            if not user.is_2fa_enabled:
                return Response({"detail": "2FA is not enabled."}, status=400)
            if not user.totp_secret:
                return Response({"detail": "2FA not properly configured."}, status=400)
                
            totp = pyotp.TOTP(user.totp_secret)
            if totp.verify(code):
                user.is_2fa_enabled = False
                # Optionally clear the secret for complete removal
                # user.totp_secret = None  # Uncomment if you want to remove the secret completely
                user.save()
                return Response({
                    "detail": "2FA disabled successfully.",
                    "is_2fa_enabled": False
                })
            else:
                return Response({"detail": "Invalid 2FA code. Cannot disable 2FA."}, status=400)
        
        return Response({"detail": "Invalid action."}, status=400)


# -------------------------
# 2FA Status Check
# -------------------------
class TwoFAStatusView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "is_2fa_enabled": user.is_2fa_enabled,
            "has_totp_secret": bool(user.totp_secret),
            "email": user.email,
            "has_backup_codes": len(user.backup_codes) > 0
        })


# -------------------------
# Generate Backup Codes
# -------------------------
class GenerateBackupCodesView(generics.GenericAPIView):
    serializer_class = BackupCodesSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if not user.is_2fa_enabled:
            return Response({"detail": "2FA must be enabled to generate backup codes."}, status=400)
        
        # Generate new backup codes
        backup_codes = generate_backup_codes()
        user.backup_codes = backup_codes
        user.save()
        
        # Send codes via email
        send_recovery_email(user.email, backup_codes)
        
        return Response({
            "backup_codes": backup_codes,
            "message": "Backup codes generated and sent to your email. Save them securely!"
        })


# -------------------------
# 2FA Recovery Login
# -------------------------
class TwoFARecoveryLoginView(generics.GenericAPIView):
    serializer_class = TwoFARecoveryLoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        recovery_code = serializer.validated_data['recovery_code']
        
        # Authenticate user
        user = authenticate(email=email, password=password)
        if not user:
            return Response({"detail": "Invalid credentials"}, status=400)
        
        if not user.is_2fa_enabled:
            return Response({"detail": "2FA is not enabled for this user."}, status=400)
        
        # Check if recovery code is valid
        if recovery_code not in user.backup_codes:
            return Response({"detail": "Invalid recovery code."}, status=400)
        
        # Remove used recovery code
        user.backup_codes.remove(recovery_code)
        user.last_recovery_used = timezone.now()
        user.save()
        
        # Send security notification
        send_recovery_notification(user.email, "Backup Recovery Code")
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
            "message": "Login successful using recovery code.",
            "remaining_codes": len(user.backup_codes)
        })


# -------------------------
# Request 2FA Recovery
# -------------------------
class TwoFARecoveryRequestView(generics.GenericAPIView):
    serializer_class = TwoFARecoveryRequestSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # Generate recovery OTP
        otp = str(random.randint(100000, 999999))
        user.otp_code = otp
        user.otp_expiry = timezone.now() + timezone.timedelta(minutes=10)
        user.save()
        
        # Send recovery instructions
        subject = "2FA Recovery Request"
        message = f"""
A 2FA recovery was requested for your account.

Your recovery OTP: {otp}
This code expires in 10 minutes.

Recovery options available:
1. Use backup recovery codes (if you have them)
2. Disable 2FA using this OTP (if you've lost access completely)

If you didn't request this, please ignore this email and secure your account.
"""
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
        
        return Response({
            "detail": "Recovery instructions sent to your email.",
            "options": [
                "Use backup recovery codes",
                "Disable 2FA completely (requires email verification)"
            ]
        })


# -------------------------
# Emergency 2FA Disable
# -------------------------
class TwoFAEmergencyDisableView(generics.GenericAPIView):
    serializer_class = TwoFARecoveryDisableSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=404)
        
        # Verify OTP
        if not user.otp_code or user.otp_code != otp:
            return Response({"detail": "Invalid OTP."}, status=400)
        
        if timezone.now() > user.otp_expiry:
            return Response({"detail": "OTP expired. Request a new recovery."}, status=400)
        
        # Disable 2FA completely
        user.is_2fa_enabled = False
        user.totp_secret = None
        user.backup_codes = []
        user.otp_code = None
        user.otp_expiry = None
        user.last_recovery_used = timezone.now()
        user.save()
        
        # Send notification
        send_recovery_notification(user.email, "Emergency 2FA Disable")
        
        return Response({
            "detail": "2FA has been completely disabled. You can now login normally.",
            "warning": "Please re-enable 2FA as soon as possible for security."
        })
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
