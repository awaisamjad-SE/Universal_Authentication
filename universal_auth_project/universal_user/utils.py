# universal_user/utils.py
from django.core.mail import send_mail
from django.conf import settings
import random
import string
import secrets

def send_otp_email(email, otp):
    """
    Send OTP to user's email.
    In production, use a proper email backend or 3rd party like SendGrid.
    """
    subject = "Your OTP Code"
    message = f"Your OTP code is: {otp}. It will expire in 10 minutes."
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]

    send_mail(subject, message, from_email, recipient_list)


def generate_backup_codes(count=10):
    """
    Generate backup recovery codes for 2FA.
    Each code is 8 characters long, alphanumeric.
    """
    codes = []
    for _ in range(count):
        code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        codes.append(code)
    return codes


def send_recovery_email(email, backup_codes):
    """
    Send backup recovery codes to user's email.
    """
    subject = "Your 2FA Recovery Codes"
    codes_list = '\n'.join([f"- {code}" for code in backup_codes])
    message = f"""
Important: Save these backup codes in a safe place!

Your 2FA recovery codes:
{codes_list}

Each code can only be used once. Use these codes if you lose access to your authenticator app.

If you didn't request this, please contact support immediately.
"""
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]

    send_mail(subject, message, from_email, recipient_list)


def send_recovery_notification(email, recovery_method_used):
    """
    Notify user when a recovery method is used.
    """
    subject = "2FA Recovery Method Used"
    message = f"""
Security Alert: A recovery method was used to access your account.

Recovery method: {recovery_method_used}
Time: Now

If this wasn't you, please secure your account immediately and contact support.
"""
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]

    send_mail(subject, message, from_email, recipient_list)
