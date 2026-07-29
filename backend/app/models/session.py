from datetime import datetime
from sqlalchemy import String, DateTime, func, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base

class DbSession(Base):
    """
    Stores intermediate authentication state during the Handshake,
    and acts as the final session record once authenticated.
    """
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    client_id: Mapped[str] = mapped_column(String(100), nullable=False)
    username: Mapped[str] = mapped_column(String(50), nullable=False)
    protocol_version: Mapped[str] = mapped_column(String(20), nullable=False, default="1.0.0")
    
    # Store the intermediate key and challenge.
    # In a real high-security system, these might be hashed or stored in memory/Redis
    # instead of persisted, but for this milestone they are stored here.
    key: Mapped[str] = mapped_column(String(255), nullable=True)
    challenge: Mapped[str] = mapped_column(String(255), nullable=True)
    
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
