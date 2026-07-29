from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime

from app.models.session import DbSession

class SessionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_handshake_session(self, session_id: str, user_id: int, client_id: str, username: str, protocol_version: str, key: str, challenge: str, expires_at: datetime) -> DbSession:
        """Stores the intermediate session state after BB84 handshake."""
        db_session = DbSession(
            session_id=session_id,
            user_id=user_id,
            client_id=client_id,
            username=username,
            protocol_version=protocol_version,
            key=key,
            challenge=challenge,
            expires_at=expires_at,
            status="pending"
        )
        self.db.add(db_session)
        self.db.commit()
        self.db.refresh(db_session)
        return db_session

    def get_by_session_id(self, session_id: str) -> DbSession | None:
        """Fetch a session by its unique session ID."""
        stmt = select(DbSession).where(DbSession.session_id == session_id)
        return self.db.scalars(stmt).first()

    def mark_authenticated(self, session: DbSession) -> DbSession:
        """Mark a session as fully authenticated and clear the intermediate challenge material."""
        session.status = "authenticated"
        # For security, clear the key/challenge once authentication is complete
        session.key = None
        session.challenge = None
        
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session
        
    def delete_session(self, session: DbSession):
        """Remove a session from the database (e.g., if expired or rejected)."""
        self.db.delete(session)
        self.db.commit()
