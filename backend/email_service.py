import os
import random
import string
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# ─────────────────────────────────────────────
# 🔹 Utility Functions
# ─────────────────────────────────────────────

def generate_otp(length=6) -> str:
    return ''.join(random.choices(string.digits, k=length))

def generate_reset_token(length=32) -> str:
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


# ─────────────────────────────────────────────
# 🔹 Send Email via SendGrid
# ─────────────────────────────────────────────

def send_email(to_email: str, subject: str, html_body: str) -> bool:
    try:
        api_key = os.getenv("SENDGRID_API_KEY")
        from_email = os.getenv("FROM_EMAIL")
        message = Mail(
            from_email=os.getenv("FROM_EMAIL"),
            to_emails=to_email,
            subject=subject,
            html_content=html_body
        )

        sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
        response = sg.send(message)

        print("✅ Email sent:", response.status_code)
        return True

    except Exception as e:
        print("❌ Email error:", str(e))
        return False


# ─────────────────────────────────────────────
# 🔹 OTP Email
# ─────────────────────────────────────────────

def send_otp_email(to_email: str, name: str, otp: str) -> bool:
    subject = "PhishGuard — Your OTP Verification Code"
    html = f"""
    <h2>Hi {name},</h2>
    <p>Your OTP is:</p>
    <h1>{otp}</h1>
    <p>This OTP is valid for 10 minutes.</p>
    """
    return send_email(to_email, subject, html)


# ─────────────────────────────────────────────
# 🔹 Reset Password Email
# ─────────────────────────────────────────────

def send_reset_email(to_email: str, name: str, reset_token: str, base_url: str) -> bool:
    reset_link = f"{base_url}/reset-password?token={reset_token}"
    subject = "PhishGuard — Password Reset"

    html = f"""
    <h2>Hi {name},</h2>
    <p>Click below to reset your password:</p>
    <a href="{reset_link}">Reset Password</a>
    <p>This link expires in 30 minutes.</p>
    """

    return send_email(to_email, subject, html)


# ─────────────────────────────────────────────
# 🔹 Welcome Email
# ─────────────────────────────────────────────

def send_welcome_email(to_email: str, name: str) -> bool:
    subject = "Welcome to PhishGuard 🎉"

    html = f"""
    <h2>Hi {name},</h2>
    <p>Your account has been created successfully.</p>
    <p>Start using PhishGuard now 🚀</p>
    """

    return send_email(to_email, subject, html)