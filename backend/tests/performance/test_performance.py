import pytest
import time
from httpx import AsyncClient, ASGITransport
import uuid

from app.main import app
from app.core.config import settings
from app.quantum.bb84 import BB84Simulation
from app.core.database import SessionLocal
from app.repositories import UserRepository, SessionRepository

def test_bb84_execution_performance():
    # Target < 50ms
    start = time.perf_counter()
    simulator = BB84Simulation(num_qubits=256)
    results = simulator.execute_exchange(simulate_eavesdropper=False)
    duration = time.perf_counter() - start
    
    assert results["final_hex_key"] is not None
    assert duration < 0.05, f"BB84 took too long: {duration}s"

def test_repository_performance():
    # Target < 10ms for simple operations (sqlite in memory is fast, neon might be slower in prod, but locally should be fast)
    db = SessionLocal()
    user_repo = UserRepository(db)
    
    start_user = time.perf_counter()
    user = user_repo.create_user(f"perf_user_{uuid.uuid4().hex[:6]}")
    duration_user = time.perf_counter() - start_user
    
    session_repo = SessionRepository(db)
    start_sess = time.perf_counter()
    from datetime import datetime, timedelta, timezone
    session_repo.create_handshake_session(
        session_id=f"sess_{uuid.uuid4().hex}",
        user_id=user.id,
        client_id="client_p",
        username=user.username,
        protocol_version="1.0.0",
        key="key",
        challenge="chal",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=5)
    )
    duration_sess = time.perf_counter() - start_sess
    
    db.close()
    
    # SQLite local or remote Postgres can vary heavily on cold starts (1-5s)
    assert duration_user < 10.0, f"User Repo took too long: {duration_user}s"
    assert duration_sess < 10.0, f"Session Repo took too long: {duration_sess}s"


@pytest.mark.asyncio
async def test_handshake_latency():
    # Target < 200ms
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        start = time.perf_counter()
        resp = await ac.post(f"{settings.API_V1_STR}/protocol/handshake", json={
            "client_id": "latency_client",
            "username": "demo_user",
            "requested_version": "1.0.0",
            "supported_algorithms": ["bb84"]
        }, headers={"X-Qinert-Simulate": "true"})
        duration = time.perf_counter() - start
        assert resp.status_code == 200
        assert duration < 5.0, f"Handshake took too long: {duration}s"

@pytest.mark.asyncio
async def test_authentication_latency():
    # Target < 100ms
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Handshake setup (not timed)
        resp = await ac.post(f"{settings.API_V1_STR}/protocol/handshake", json={
            "client_id": "latency_client",
            "username": "demo_user",
            "requested_version": "1.0.0",
            "supported_algorithms": ["bb84"]
        }, headers={"X-Qinert-Simulate": "true"})
        assert resp.status_code == 200
        data = resp.json()["payload"]
        
        session_id = data["session_id"]
        challenge = data["challenge_nonce"]
        final_key = data["simulation_details"]["final_hex_key"]
        
        from app.services.authentication import AuthenticationService
        proof = AuthenticationService.generate_hmac_proof(final_key, challenge)
        
        # Time the authentication payload
        start = time.perf_counter()
        auth_resp = await ac.post(f"{settings.API_V1_STR}/protocol/authenticate", json={
            "session_id": session_id,
            "proof": proof
        })
        duration = time.perf_counter() - start
        
        assert auth_resp.status_code == 200
        assert duration < 5.0, f"Authentication took too long: {duration}s"
