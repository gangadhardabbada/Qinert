import pytest
from app.repositories.user_repo import UserRepository
from app.models.user import User

def test_create_user(db_session):
    repo = UserRepository(db_session)
    user = repo.create_user("alice")
    
    assert user.id is not None
    assert user.username == "alice"
    assert user.is_active is True

def test_get_by_username(db_session, sample_user):
    repo = UserRepository(db_session)
    found = repo.get_by_username(sample_user.username)
    
    assert found is not None
    assert found.id == sample_user.id
    
    missing = repo.get_by_username("nonexistent")
    assert missing is None

def test_create_duplicate_user_exception(db_session, sample_user):
    from sqlalchemy.exc import IntegrityError
    repo = UserRepository(db_session)
    
    with pytest.raises(IntegrityError):
        repo.create_user(sample_user.username)
        # Flush to trigger DB constraint in SQLite
        db_session.flush()
