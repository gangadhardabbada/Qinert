import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.core.config import settings

client = TestClient(app)

@pytest.fixture
def test_client():
    return TestClient(app)

@pytest.mark.asyncio
async def test_get_protocol_version():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get(f"{settings.API_V1_STR}/protocol/version")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "payload" in data
    assert data["payload"]["version"] == "1.0.0"

@pytest.mark.asyncio
async def test_handshake_invalid_version():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(f"{settings.API_V1_STR}/protocol/handshake", json={
            "client_id": "test_client",
            "username": "demo_user",
            "requested_version": "2.0.0",
            "supported_algorithms": ["bb84"]
        }, headers={"X-Qinert-Simulate": "true"})
    
    assert response.status_code == 400
    data = response.json()
    assert data["status"] == "error"
    assert data["payload"]["error_code"] == "QPS-1001"

@pytest.mark.asyncio
async def test_handshake_success():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(f"{settings.API_V1_STR}/protocol/handshake", json={
            "client_id": "test_client",
            "username": "demo_user",
            "requested_version": "1.0.0",
            "supported_algorithms": ["bb84"]
        }, headers={"X-Qinert-Simulate": "true"})
    
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "session_id" in data["payload"]
        assert "simulation_details" in data["payload"]
        
        # Store session for auth test
        session_id = data["payload"]["session_id"]
        challenge = data["payload"]["challenge_nonce"]
        final_key = data["payload"]["simulation_details"]["final_hex_key"]

        # Let's test authenticate
        from app.services.authentication import AuthenticationService
        proof = AuthenticationService.generate_hmac_proof(final_key, challenge)

        auth_response = await ac.post(f"{settings.API_V1_STR}/protocol/authenticate", json={
            "session_id": session_id,
            "proof": proof
        }, headers={"X-Qinert-Simulate": "true"})
        
        assert auth_response.status_code == 200
        auth_data = auth_response.json()
        assert auth_data["status"] == "success"
        assert auth_data["payload"]["status"] == "authenticated"

@pytest.mark.asyncio
async def test_handshake_malformed_json():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(f"{settings.API_V1_STR}/protocol/handshake", content="not json")
    
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_handshake_missing_fields():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(f"{settings.API_V1_STR}/protocol/handshake", json={
            "client_id": "test_client",
            # missing username, requested_version, supported_algorithms
        })
    
    # FastAPI returns 422 for missing fields usually, but our exception handler wraps it if we mapped it.
    # The default FastAPI handler is wrapped by `http_exception_handler` in `main.py`.
    # Wait, `RequestValidationError` might not be handled if we didn't add an exception handler for it,
    # or if we did, it's 422. Let's assert it fails.
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_authenticate_incorrect_proof():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Handshake
        response = await ac.post(f"{settings.API_V1_STR}/protocol/handshake", json={
            "client_id": "test_client",
            "username": "demo_user",
            "requested_version": "1.0.0",
            "supported_algorithms": ["bb84"]
        }, headers={"X-Qinert-Simulate": "true"})
        assert response.status_code == 200
        session_id = response.json()["payload"]["session_id"]
        
        # 2. Authenticate with bad proof
        auth_response = await ac.post(f"{settings.API_V1_STR}/protocol/authenticate", json={
            "session_id": session_id,
            "proof": "bad_proof_string"
        }, headers={"X-Qinert-Simulate": "true"})
        
        assert auth_response.status_code == 401
        data = auth_response.json()
        assert data["payload"]["error_code"] == "QPS-3000"

from unittest.mock import patch

@pytest.mark.asyncio
async def test_handshake_high_qber_rejection():
    # Mock the execute_exchange to return a high QBER and None for final_key
    with patch("app.routers.protocol.BB84Protocol.execute_exchange") as mock_exchange:
        mock_exchange.return_value = {
            "initial_qubit_count": 256,
            "qber": 0.25, # High QBER
            "is_secure": False,
            "final_hex_key": None
        }
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post(f"{settings.API_V1_STR}/protocol/handshake", json={
                "client_id": "test_client",
                "username": "demo_user",
                "requested_version": "1.0.0",
                "supported_algorithms": ["bb84"]
            }, headers={"X-Qinert-Simulate": "true"})
        
        assert response.status_code == 400
        data = response.json()
        assert data["status"] == "error"
        assert data["payload"]["error_code"] == "QPS-2001"
