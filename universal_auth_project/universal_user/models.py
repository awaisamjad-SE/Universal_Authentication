# universal_user/models.py
import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone


# -----------------------------
# Custom User Manager
# -----------------------------
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(email, password, **extra_fields)


# -----------------------------
# User Model
# -----------------------------
class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)

    # status flags
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    # -----------------------------
    # Authentication extras
    # -----------------------------
    is_email_verified = models.BooleanField(default=False)       # Email verification
    otp_code = models.CharField(max_length=6, blank=True, null=True)  # OTP for email or phone
    otp_expiry = models.DateTimeField(blank=True, null=True)

    is_2fa_enabled = models.BooleanField(default=False)          # 2FA enabled
    totp_secret = models.CharField(max_length=32, blank=True, null=True)  # TOTP secret for Authenticator apps
    
    # Recovery options
    backup_codes = models.JSONField(default=list, blank=True)    # Backup recovery codes
    recovery_email = models.EmailField(blank=True, null=True)    # Alternative recovery email
    last_recovery_used = models.DateTimeField(blank=True, null=True)  # Track recovery usage

    # config
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = UserManager()

    def __str__(self):
        return self.email

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
