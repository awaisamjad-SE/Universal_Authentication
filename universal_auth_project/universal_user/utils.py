# universal_user/utils.py
from django.core.mail import send_mail
from django.conf import settings

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
