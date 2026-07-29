import pytest
from datetime import datetime, timedelta
from app.repositories.session_repo import SessionRepository
from app.models.session import DbSession

def test_create_handshake_session(db_session, sample_user):
    repo = SessionRepository(db_session)
    expires = datetime.now() + timedelta(minutes=10)
    
    session = repo.create_handshake_session(
        session_id="test_sess_1",
        user_id=sample_user.id,
        client_id="client_1",
        username=sample_user.username,
        protocol_version="1.0.0",
        key="deadbeef",
        challenge="challenge_str",
        expires_at=expires
    )
    
    assert session.id is not None
    assert session.session_id == "test_sess_1"
    assert session.user_id == sample_user.id
    assert session.key == "deadbeef"
    assert session.status == "pending"

def test_get_by_session_id(db_session, sample_user):
    repo = SessionRepository(db_session)
    repo.create_handshake_session(
        session_id="test_sess_2",
        user_id=sample_user.id,
        client_id="client_1",
        username=sample_user.username,
        protocol_version="1.0.0",
        key="deadbeef",
        challenge="challenge_str",
        expires_at=datetime.now()
    )
    
    found = repo.get_by_session_id("test_sess_2")
    assert found is not None
    assert found.session_id == "test_sess_2"
    
    missing = repo.get_by_session_id("nonexistent")
    assert missing is None

def test_mark_authenticated(db_session, sample_user):
    repo = SessionRepository(db_session)
    session = repo.create_handshake_session(
        session_id="test_sess_3",
        user_id=sample_user.id,
        client_id="client_1",
        username=sample_user.username,
        protocol_version="1.0.0",
        key="deadbeef",
        challenge="challenge_str",
        expires_at=datetime.now()
    )
    
    assert session.status == "pending"
    repo.mark_authenticated(session)
    
    updated = repo.get_by_session_id("test_sess_3")
    assert updated.status == "authenticated"

def test_delete_session(db_session, sample_user):
    repo = SessionRepository(db_session)
    session = repo.create_handshake_session(
        session_id="test_sess_4",
        user_id=sample_user.id,
        client_id="client_1",
        username=sample_user.username,
        protocol_version="1.0.0",
        key="deadbeef",
        challenge="challenge_str",
        expires_at=datetime.now()
    )
    
    repo.delete_session(session)
    
    found = repo.get_by_session_id("test_sess_4")
    assert found is None
