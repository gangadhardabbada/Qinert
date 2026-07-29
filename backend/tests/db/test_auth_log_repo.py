import pytest
from app.repositories.auth_log_repo import AuthLogRepository
from app.models.auth_log import AuthenticationLog

def test_log_event(db_session):
    repo = AuthLogRepository(db_session)
    repo.log_event(
        authentication_result="AUTH_SUCCESS",
        session_id="sess_123",
        qber=0.05
    )
    
    # Query to verify it was created
    log_entry = db_session.query(AuthenticationLog).filter_by(session_id="sess_123").first()
    assert log_entry is not None
    assert log_entry.authentication_result == "AUTH_SUCCESS"
    assert log_entry.qber == 0.05

def test_log_event_no_qber(db_session):
    repo = AuthLogRepository(db_session)
    repo.log_event(
        authentication_result="HANDSHAKE_FAILED",
        session_id=None
    )
    
    log_entry = db_session.query(AuthenticationLog).filter_by(authentication_result="HANDSHAKE_FAILED").first()
    assert log_entry is not None
    assert log_entry.session_id is None
    assert log_entry.qber is None
