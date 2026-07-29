from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, func, Text, Float
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base

class AuthenticationLog(Base):
    """
    Audit log for authentication attempts and quantum protocol failures.
    """
    __tablename__ = "auth_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(100), index=True, nullable=True)
    qber: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    authentication_result: Mapped[str] = mapped_column(String(50), nullable=False)
    
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
