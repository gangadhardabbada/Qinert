from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.user import User

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_username(self, username: str) -> User | None:
        """Fetch a user by their username."""
        stmt = select(User).where(func.lower(User.username) == username.lower())
        return self.db.scalars(stmt).first()

    def create_user(self, username: str, is_active: bool = True) -> User:
        """Create a new user (primarily for mock/seed data)."""
        user = User(username=username, is_active=is_active)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
