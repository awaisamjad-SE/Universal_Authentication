# universal_user/urls.py
from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    SendOTPView,
    VerifyOTPView,
    PasswordResetView,
    PasswordResetConfirmView,
    TwoFASetupView,
    TwoFAVerifyView,
    TwoFALoginView,
    TwoFAToggleView,
    TwoFAStatusView,
    GenerateBackupCodesView,
    TwoFARecoveryLoginView,
    TwoFARecoveryRequestView,
    TwoFAEmergencyDisableView
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("send-otp/", SendOTPView.as_view(), name="send-otp"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("password-reset/", PasswordResetView.as_view(), name="password-reset"),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    
    # 2FA Management
    path("2fa/setup/", TwoFASetupView.as_view(), name="2fa-setup"),
    path("2fa/verify/", TwoFAVerifyView.as_view(), name="2fa-verify"),
    path("2fa/login/", TwoFALoginView.as_view(), name="2fa-login"),
    path("2fa/toggle/", TwoFAToggleView.as_view(), name="2fa-toggle"),
    path("2fa/status/", TwoFAStatusView.as_view(), name="2fa-status"),
    
    # 2FA Recovery Options
    path("2fa/backup-codes/", GenerateBackupCodesView.as_view(), name="2fa-backup-codes"),
    path("2fa/recovery-login/", TwoFARecoveryLoginView.as_view(), name="2fa-recovery-login"),
    path("2fa/recovery-request/", TwoFARecoveryRequestView.as_view(), name="2fa-recovery-request"),
    path("2fa/emergency-disable/", TwoFAEmergencyDisableView.as_view(), name="2fa-emergency-disable"),
]
