from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta, timezone
import jwt
import logging
from app.services.otp_service import OTPService
from app.services.email_service import EmailService

logger = logging.getLogger(__name__)
router = APIRouter()
JWT_SECRET = "7a0e5d92b1c88e1c63d1a89e4fb13f4dbf91d42e5d667f53b00c8a9d95f1fbc7" # In production, use settings.JWT_SECRET

class SendOtpRequest(BaseModel):
    email: EmailStr

class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str

@router.post("/send-otp")
async def send_otp(req: SendOtpRequest, background_tasks: BackgroundTasks):
    try:
        otp = OTPService.generate_and_store_otp(req.email)
    except ValueError as e:
        if str(e) == "RATE_LIMIT_HOUR":
            raise HTTPException(status_code=429, detail="Too many requests. Maximum 5 OTPs per hour.")
        elif str(e) == "RATE_LIMIT_MINUTE":
            raise HTTPException(status_code=429, detail="Please wait 60 seconds before requesting another OTP.")
        else:
            raise HTTPException(status_code=500, detail="Internal Server Error")
            
    # Send email asynchronously
    # Note: For production, we should handle if SMTP fails, but the background task means it returns 200 immediately.
    # To truly return 500 on SMTP failure on send, we would await it here.
    # However, to be fast, we can try to send it synchronously or keep it async and rely on logs.
    try:
        success = await EmailService.send_otp_email(req.email, otp)
    except ValueError as e:
        logger.error(f"Configuration Error: {e}")
        raise HTTPException(status_code=500, detail="Email service is not configured correctly.")

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email.")
        
    return {"success": True, "message": "Verification code sent."}

@router.post("/verify-otp")
async def verify_otp(req: VerifyOtpRequest):
    try:
        OTPService.verify_otp(req.email, req.otp)
    except ValueError as e:
        if str(e) == "INVALID_EMAIL":
            raise HTTPException(status_code=400, detail="OTP not requested or expired.")
        elif str(e) == "EXPIRED":
            raise HTTPException(status_code=410, detail="OTP has expired.")
        elif str(e) == "MAX_ATTEMPTS":
            raise HTTPException(status_code=410, detail="Too many failed attempts. Please request a new OTP.")
        elif str(e) == "INVALID_OTP":
            raise HTTPException(status_code=401, detail="Invalid OTP.")
        else:
            raise HTTPException(status_code=400, detail="Bad Request.")
            
    # Success
    now = datetime.now(timezone.utc)
    token_data = {
        "sub": req.email,
        "exp": now + timedelta(minutes=15),
        "type": "tempToken"
    }
    temp_token = jwt.encode(token_data, JWT_SECRET, algorithm="HS256")
    
    return {"verified": True, "tempToken": temp_token}

@router.post("/test-email")
async def test_email():
    """This endpoint is for development only to test SMTP config."""
    success = await EmailService.send_otp_email("test@example.com", "123456")
    if success:
        return {"success": True}
    else:
        raise HTTPException(status_code=500, detail="SMTP failure")
