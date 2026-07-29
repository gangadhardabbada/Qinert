import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
# Import all models to ensure they are registered with Base.metadata
from app.models.user import User
from app.models.session import DbSession
from app.models.auth_log import AuthenticationLog

# Use an in-memory SQLite database for tests to isolate transactions
TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="session")
def engine():
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    # Create all tables
    Base.metadata.create_all(bind=engine)
    yield engine
    # Drop all tables after the test session
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session(engine):
    """
    Creates a new database session for a test.
    """
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    
    yield session
    
    # Roll back any transactions so the database state is pristine for the next test
    session.rollback()
    
    # Clear out all tables instead of dropping them
    for table in reversed(Base.metadata.sorted_tables):
        session.execute(table.delete())
    session.commit()
    
    session.close()

@pytest.fixture
def sample_user(db_session):
    from app.models.user import User
    user = User(username="test_user", email="test@example.com", is_active=True)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user
