import pytest
from httpx import AsyncClient, ASGITransport
import uuid
import asyncio
from datetime import datetime, timedelta

from app.main import app
from app.core.config import settings
from app.services.authentication import AuthenticationService
from app.core.database import SessionLocal
from app.repositories import SessionRepository, UserRepository
from app.models.session import DbSession

@pytest.mark.asyncio
async def test_replay_attack():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Handshake
        resp = await ac.post(f"{settings.API_V1_STR}/protocol/handshake", json={
            "client_id": "replay_client",
            "username": "demo_user",
            "requested_version": "1.0.0",
            "supported_algorithms": ["bb84"]
        }, headers={"X-Qinert-Simulate": "true"})
        assert resp.status_code == 200
        data = resp.json()["payload"]
        
        session_id = data["session_id"]
        challenge = data["challenge_nonce"]
        final_key = data["simulation_details"]["final_hex_key"]
        
        proof = AuthenticationService.generate_hmac_proof(final_key, challenge)
        auth_payload = {
            "session_id": session_id,
            "proof": proof
        }
        
        # 2. Authenticate initially
        auth_resp_1 = await ac.post(f"{settings.API_V1_STR}/protocol/authenticate", json=auth_payload)
        assert auth_resp_1.status_code == 200
        
        # 3. Replay attack: send the same payload again
        auth_resp_2 = await ac.post(f"{settings.API_V1_STR}/protocol/authenticate", json=auth_payload)
        # Should be rejected because key/challenge were cleared
        assert auth_resp_2.status_code == 401
        assert auth_resp_2.json()["payload"]["error_code"] == "QPS-3002"

@pytest.mark.asyncio
async def test_invalid_session():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(f"{settings.API_V1_STR}/protocol/authenticate", json={
            "session_id": "invalid_session_uuid",
            "proof": "any_proof"
        })
        assert resp.status_code == 400
        assert resp.json()["payload"]["error_code"] == "QPS-1100"

@pytest.mark.asyncio
async def test_expired_session():
    # Setup expired session manually in DB
    db = SessionLocal()
    user_repo = UserRepository(db)
    user = user_repo.get_by_username("demo_user")
    if not user:
        user = user_repo.create_user("demo_user")
        
    session_repo = SessionRepository(db)
    expired_sess_id = f"sess_{uuid.uuid4().hex}"
    from datetime import timezone
    # Set expiration to 10 minutes ago, with UTC timezone
    expires = datetime.now(timezone.utc) - timedelta(minutes=10)
    
    session_repo.create_handshake_session(
        session_id=expired_sess_id,
        user_id=user.id,
        client_id="test_client",
        username="demo_user",
        protocol_version="1.0.0",
        key="deadbeef",
        challenge="expired_challenge",
        expires_at=expires
    )
    db.close()
    
    # Try to authenticate against it
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(f"{settings.API_V1_STR}/protocol/authenticate", json={
            "session_id": expired_sess_id,
            "proof": "some_proof" # Valid format, doesn't matter if wrong
        })
        
        # In protocol.py, it checks expiration.
        assert resp.status_code == 401
        assert resp.json()["payload"]["error_code"] == "QPS-4000"

@pytest.mark.asyncio
async def test_duplicate_handshake_requests():
    # Send 2 concurrent handshakes and ensure they get different session IDs
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        req_payload = {
            "client_id": "dup_client",
            "username": "demo_user",
            "requested_version": "1.0.0",
            "supported_algorithms": ["bb84"]
        }
        
        coro1 = ac.post(f"{settings.API_V1_STR}/protocol/handshake", json=req_payload)
        coro2 = ac.post(f"{settings.API_V1_STR}/protocol/handshake", json=req_payload)
        
        r1, r2 = await asyncio.gather(coro1, coro2)
        
        assert r1.status_code == 200
        assert r2.status_code == 200
        
        s1 = r1.json()["payload"]["session_id"]
        s2 = r2.json()["payload"]["session_id"]
        
        # Even though they are the exact same payload sent at the exact same time, 
        # they should initiate isolated cryptographic exchanges and have distinct session tracking IDs
        assert s1 != s2
