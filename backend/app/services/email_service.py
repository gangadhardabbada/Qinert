import logging
import httpx
from jinja2 import Template
from app.core.config import settings

logger = logging.getLogger(__name__)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
  <body style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #3B82F6;">Qonsole Verification Code</h2>
    <p>Hello,</p>
    <p>Your verification code is</p>
    <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111827; padding: 20px 0;">
      {{ OTP }}
    </div>
    <p>This code expires in 5 minutes.</p>
    <p style="color: #666; font-size: 12px; margin-top: 40px;">If you didn't request this code, ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-weight: bold; font-size: 14px; margin-bottom: 0;">Qonsole</p>
    <p style="color: #666; font-size: 12px; margin-top: 4px;">Real-Time Quantum Verification Engine</p>
  </body>
</html>
"""

class EmailService:
    @staticmethod
    async def send_otp_email(to_email: str, otp: str) -> bool:
        if not settings.MAILJET_API_KEY or not settings.MAILJET_SECRET_KEY:
            # As per requirements, raise a clear configuration error if the secret key is missing.
            raise ValueError("MAILJET_SECRET_KEY or MAILJET_API_KEY is not configured in the environment.")

        # Plain text fallback
        plain_text = f"Hello,\n\nYour verification code is {otp}\n\nThis code expires in 5 minutes.\nIf you didn't request this code, ignore this email.\n\nQonsole\nReal-Time Quantum Verification Engine"
        
        # HTML 
        template = Template(HTML_TEMPLATE)
        html_content = template.render(OTP=otp)

        payload = {
            "Messages": [
                {
                    "From": {
                        "Email": settings.MAILJET_FROM_EMAIL,
                        "Name": settings.MAILJET_FROM_NAME
                    },
                    "To": [
                        {
                            "Email": to_email
                        }
                    ],
                    "Subject": "Qonsole Verification Code",
                    "TextPart": plain_text,
                    "HTMLPart": html_content
                }
            ]
        }

        url = "https://api.mailjet.com/v3.1/send"
        auth = (settings.MAILJET_API_KEY, settings.MAILJET_SECRET_KEY)

        retries = 1
        for attempt in range(retries + 1):
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(url, json=payload, auth=auth, timeout=10.0)
                    response.raise_for_status()
                    return True
            except httpx.TimeoutException as e:
                logger.error(f"Timeout connecting to Mailjet API (attempt {attempt+1}/{retries+1}): {e}")
                if attempt == retries:
                    return False
            except httpx.HTTPStatusError as e:
                logger.error(f"Mailjet API returned HTTP error for {to_email}: {e.response.status_code} - {e.response.text}")
                return False
            except Exception as e:
                logger.error(f"Unexpected error sending email to {to_email} via Mailjet: {e}\nStacktrace:", exc_info=True)
                return False
                
        return False
