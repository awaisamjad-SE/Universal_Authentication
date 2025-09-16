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
    TwoFALoginView
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
    path("2fa/setup/", TwoFASetupView.as_view(), name="2fa-setup"),
    path("2fa/verify/", TwoFAVerifyView.as_view(), name="2fa-verify"),
    path("2fa/login/", TwoFALoginView.as_view(), name="2fa-login"),
]
