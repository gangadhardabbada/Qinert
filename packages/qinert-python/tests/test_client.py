import pytest
import respx
import httpx
from qinert import QinertClient, AsyncQinertClient
from qinert.errors import InvalidStateError, QberThresholdExceededError

@respx.mock
def test_sync_client_workflow():
    # Setup mocks
    respx.post("http://test/api/v1/protocol/handshake").mock(return_value=httpx.Response(
        200,
        json={
            "status": "success",
            "payload": {
                "session_id": "sess-123",
                "challenge_nonce": "aabbccdd",
                "expires_at": "2030-01-01",
                "simulation_details": {
                    "final_hex_key": "0102030405060708090a0b0c0d0e0f10"
                }
            }
        }
    ))

    respx.post("http://test/api/v1/protocol/authenticate").mock(return_value=httpx.Response(
        200,
        json={
            "status": "success",
            "payload": {
                "session_id": "sess-123",
                "session_token": "jwt.token.here",
                "expires_at": "2030-01-01"
            }
        }
    ))

    with QinertClient(base_url="http://test") as client:
        # Invalid state test
        with pytest.raises(InvalidStateError):
            client.authenticate()

        # Handshake
        hs = client.handshake(client_id="test")
        assert hs.payload.session_id == "sess-123"
        assert client._state == "PROOF_PENDING"
        assert client._shared_secret == "0102030405060708090a0b0c0d0e0f10"

        # Authenticate
        auth = client.authenticate()
        assert auth.payload.session_token == "jwt.token.here"
        assert client._state == "SESSION_ACTIVE"

        # Zeroization check
        assert getattr(client, "_shared_secret", None) is None


@pytest.mark.asyncio
@respx.mock
async def test_async_client_error_mapping():
    respx.post("http://test/api/v1/protocol/handshake").mock(return_value=httpx.Response(
        403,
        json={
            "status": "error",
            "payload": {
                "error_code": "QPS-2001",
                "message": "QBER Too High"
            }
        }
    ))

    async with AsyncQinertClient(base_url="http://test") as client:
        with pytest.raises(QberThresholdExceededError):
            await client.handshake(client_id="test")
