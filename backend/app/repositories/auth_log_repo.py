from sqlalchemy.orm import Session
from typing import Optional

from app.models.auth_log import AuthenticationLog

class AuthLogRepository:
    def __init__(self, db: Session):
        self.db = db

    def log_event(self, authentication_result: str, session_id: Optional[str] = None, qber: Optional[float] = None):
        """Log an authentication or protocol event."""
        log_entry = AuthenticationLog(
            session_id=session_id,
            qber=qber,
            authentication_result=authentication_result
        )
        self.db.add(log_entry)
        self.db.commit()
