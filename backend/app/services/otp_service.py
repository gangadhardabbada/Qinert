import secrets
import logging
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from app.core.config import settings

logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory store: { "email": { "hashed_otp": str, "created_at": dt, "expires_at": dt, "attempts": int, "history": list[dt] } }
otp_store = {}

class OTPService:
    @staticmethod
    def _cleanup_history(history: list) -> list:
        now = datetime.now(timezone.utc)
        return [t for t in history if t > now - timedelta(hours=1)]

    @staticmethod
    def generate_and_store_otp(email: str) -> str:
        """Generates OTP, hashes it, stores it, and returns the plain OTP. Enforces rate limits."""
        email = email.lower()
        now = datetime.now(timezone.utc)
        
        if email not in otp_store:
            otp_store[email] = {"history": []}
            
        store = otp_store[email]
        store["history"] = OTPService._cleanup_history(store.get("history", []))
        
        # Check max 5 per hour
        if len(store["history"]) >= 5:
            raise ValueError("RATE_LIMIT_HOUR")
            
        # Check 1 per 60 seconds (Backend respects the frontend's 60s timer)
        if store["history"] and store["history"][-1] > now - timedelta(seconds=60):
            raise ValueError("RATE_LIMIT_MINUTE")
            
        # Generate 6-digit OTP
        otp = "".join([str(secrets.randbelow(10)) for _ in range(6)])
        hashed_otp = pwd_context.hash(otp)
        
        # Store
        store["hashed_otp"] = hashed_otp
        store["created_at"] = now
        store["expires_at"] = now + timedelta(minutes=5)
        store["attempts"] = 0
        store["history"].append(now)
        
        if settings.DEBUG:
            logger.info(f"[DEBUG] Generated OTP for {email}: {otp}")
            
        return otp

    @staticmethod
    def verify_otp(email: str, otp: str) -> bool:
        """Verifies an OTP. Raises ValueError on failure."""
        email = email.lower()
        now = datetime.now(timezone.utc)
        
        if email not in otp_store or "hashed_otp" not in otp_store[email] or otp_store[email]["hashed_otp"] is None:
            raise ValueError("INVALID_EMAIL")
            
        store = otp_store[email]
        
        if store.get("expires_at") is None or store["expires_at"] < now:
            raise ValueError("EXPIRED")
            
        if store.get("attempts", 0) >= 5:
            store["expires_at"] = None  # Invalidate immediately
            raise ValueError("MAX_ATTEMPTS")
            
        store["attempts"] = store.get("attempts", 0) + 1
        
        if not pwd_context.verify(otp, store["hashed_otp"]):
            raise ValueError("INVALID_OTP")
            
        # Success! Invalidate
        store["hashed_otp"] = None
        store["expires_at"] = None
        
        return True
