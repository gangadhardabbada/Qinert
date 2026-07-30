import os
import aiosmtplib
from email.message import EmailMessage

async def send_verification_email(to_email: str, otp: str):
    smtp_host = os.environ.get("SMTP_HOST", "")
    smtp_port = int(os.environ.get("SMTP_PORT", 587))
    smtp_user = os.environ.get("SMTP_USERNAME", "")
    smtp_password = os.environ.get("SMTP_PASSWORD", "")
    smtp_from = os.environ.get("SMTP_FROM", "noreply@qonsole.example.com")

    if not smtp_host or not smtp_user or not smtp_password:
        # If SMTP is not configured, just print to console for development/demo purposes
        print(f"=== MOCK EMAIL ===")
        print(f"To: {to_email}")
        print(f"Subject: Qonsole Verification Code")
        print(f"Body: Hello,\n\nYour Qonsole verification code is\n{otp}\n\nThe code expires in 5 minutes.\nIf you didn't request this verification, simply ignore this email.\n\nQonsole\nReal-Time Quantum Verification Engine")
        print(f"==================")
        return True

    message = EmailMessage()
    message["From"] = smtp_from
    message["To"] = to_email
    message["Subject"] = "Qonsole Verification Code"
    
    html_content = f"""
    <html>
      <body style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #3B82F6;">Qonsole Identity Verification</h2>
        <p>Hello,</p>
        <p>Your Qonsole verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111827; padding: 20px 0;">
          {otp}
        </div>
        <p>The code expires in 5 minutes.</p>
        <p style="color: #666; font-size: 12px; margin-top: 40px;">If you didn't request this verification, simply ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-weight: bold; font-size: 14px; margin-bottom: 0;">Qonsole</p>
        <p style="color: #666; font-size: 12px; margin-top: 4px;">Real-Time Quantum Verification Engine</p>
      </body>
    </html>
    """
    message.set_content(f"Your Qonsole verification code is {otp}")
    message.add_alternative(html_content, subtype="html")

    try:
        await aiosmtplib.send(
            message,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_user,
            password=smtp_password,
            start_tls=True if smtp_port == 587 else False
        )
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
