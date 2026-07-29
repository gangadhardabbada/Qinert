import hmac
import hashlib
import httpx
from typing import Optional, List, Dict, Any

from .errors import InvalidStateError, map_error_response, QinertError
from .models import HandshakeResponse, AuthResponse

class QinertClient:
    def __init__(self, base_url: str, timeout: float = 5.0):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._client = httpx.Client(base_url=self.base_url, timeout=self.timeout)
        self._reset_state()

    def _reset_state(self):
        self._state = "INITIAL"
        self._session_id: Optional[str] = None
        self._shared_secret: Optional[str] = None
        self._session_token: Optional[str] = None
        self._challenge_nonce: Optional[str] = None

    def __enter__(self):
        self._client.__enter__()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self._client.__exit__(exc_type, exc_val, exc_tb)
        self.terminate_session()

    def _request(self, method: str, endpoint: str, payload: Optional[Dict[str, Any]] = None) -> dict:
        headers = {"Content-Type": "application/json"}
        if self._session_token:
            headers["Authorization"] = f"Bearer {self._session_token}"

        try:
            response = self._client.request(method, endpoint, headers=headers, json=payload)
            data = response.json()
            if not response.is_success or data.get("status") == "error":
                raise map_error_response(data)
            return data
        except httpx.TimeoutException:
            raise QinertError("Request timed out", "QPS-5004")

    def initiate(self, supported_algorithms: List[str] = None) -> dict:
        if self._state != "INITIAL":
            raise InvalidStateError()
        self._state = "IDENTIFIED"
        return {"status": "identified", "supported_algorithms": supported_algorithms or ["bb84"]}

    def handshake(self, client_id: str, requested_version: str = "1.0.0") -> HandshakeResponse:
        if self._state not in ("INITIAL", "IDENTIFIED"):
            raise InvalidStateError()

        self._state = "KEY_ESTABLISHING"
        
        # We send X-Qinert-Simulate to request the server to send us the simulated key
        # since this client does not yet generate quantum bits natively.
        headers = {"X-Qinert-Simulate": "true"}
        if self._session_token:
            headers["Authorization"] = f"Bearer {self._session_token}"

        try:
            response = self._client.request("POST", "/api/v1/protocol/handshake", headers=headers, json={
                "client_id": client_id,
                "username": client_id, # Mocking username to match client_id for tests
                "requested_version": requested_version,
                "supported_algorithms": ["bb84"]
            })
            data = response.json()
            if not response.is_success or data.get("status") == "error":
                raise map_error_response(data)
        except httpx.TimeoutException:
            raise QinertError("Request timed out", "QPS-5004")

        resp = HandshakeResponse(**data)
        
        self._session_id = resp.payload.session_id
        self._challenge_nonce = resp.payload.challenge_nonce
        self._shared_secret = resp.payload.simulation_details.final_hex_key
        
        self._state = "PROOF_PENDING"
        return resp

    def authenticate(self) -> AuthResponse:
        if self._state != "PROOF_PENDING":
            raise InvalidStateError()
        if not self._shared_secret or not self._challenge_nonce:
            raise QinertError("Missing secret or challenge nonce", "QPS-INTERNAL")

        try:
            # 1. Prepare key and message
            key_bytes = bytes.fromhex(self._shared_secret)
            msg_bytes = self._challenge_nonce.encode("utf-8")
            
            # 2. Compute HMAC-SHA-256
            mac = hmac.new(key_bytes, msg_bytes, digestmod=hashlib.sha256)
            proof_hex = mac.hexdigest()

            # 3. Submit
            data = self._request("POST", "/api/v1/protocol/authenticate", {
                "session_id": self._session_id,
                "proof": proof_hex
            })

            resp = AuthResponse(**data)
            self._session_token = resp.payload.session_token
            self._state = "SESSION_ACTIVE"
            return resp

        finally:
            # SECURITY: Zeroize the shared secret
            if hasattr(self, '_shared_secret'):
                self._shared_secret = None
                del self._shared_secret
            self._challenge_nonce = None

    def get_session(self) -> Optional[str]:
        return self._session_token

    def terminate_session(self):
        self._reset_state()


class AsyncQinertClient:
    def __init__(self, base_url: str, timeout: float = 5.0):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._client = httpx.AsyncClient(base_url=self.base_url, timeout=self.timeout)
        self._reset_state()

    def _reset_state(self):
        self._state = "INITIAL"
        self._session_id: Optional[str] = None
        self._shared_secret: Optional[str] = None
        self._session_token: Optional[str] = None
        self._challenge_nonce: Optional[str] = None

    async def __aenter__(self):
        await self._client.__aenter__()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self._client.__aexit__(exc_type, exc_val, exc_tb)
        self.terminate_session()

    async def _request(self, method: str, endpoint: str, payload: Optional[Dict[str, Any]] = None) -> dict:
        headers = {"Content-Type": "application/json"}
        if self._session_token:
            headers["Authorization"] = f"Bearer {self._session_token}"

        try:
            response = await self._client.request(method, endpoint, headers=headers, json=payload)
            data = response.json()
            if not response.is_success or data.get("status") == "error":
                raise map_error_response(data)
            return data
        except httpx.TimeoutException:
            raise QinertError("Request timed out", "QPS-5004")

    async def initiate(self, supported_algorithms: List[str] = None) -> dict:
        if self._state != "INITIAL":
            raise InvalidStateError()
        self._state = "IDENTIFIED"
        return {"status": "identified", "supported_algorithms": supported_algorithms or ["bb84"]}

    async def handshake(self, client_id: str, requested_version: str = "1.0.0") -> HandshakeResponse:
        if self._state not in ("INITIAL", "IDENTIFIED"):
            raise InvalidStateError()

        self._state = "KEY_ESTABLISHING"
        
        headers = {"X-Qinert-Simulate": "true"}
        if self._session_token:
            headers["Authorization"] = f"Bearer {self._session_token}"

        try:
            response = await self._client.request("POST", "/api/v1/protocol/handshake", headers=headers, json={
                "client_id": client_id,
                "username": client_id,
                "requested_version": requested_version,
                "supported_algorithms": ["bb84"]
            })
            data = response.json()
            if not response.is_success or data.get("status") == "error":
                raise map_error_response(data)
        except httpx.TimeoutException:
            raise QinertError("Request timed out", "QPS-5004")

        resp = HandshakeResponse(**data)
        
        self._session_id = resp.payload.session_id
        self._challenge_nonce = resp.payload.challenge_nonce
        self._shared_secret = resp.payload.simulation_details.final_hex_key
        
        self._state = "PROOF_PENDING"
        return resp

    async def authenticate(self) -> AuthResponse:
        if self._state != "PROOF_PENDING":
            raise InvalidStateError()
        if not self._shared_secret or not self._challenge_nonce:
            raise QinertError("Missing secret or challenge nonce", "QPS-INTERNAL")

        try:
            key_bytes = bytes.fromhex(self._shared_secret)
            msg_bytes = self._challenge_nonce.encode("utf-8")
            
            mac = hmac.new(key_bytes, msg_bytes, digestmod=hashlib.sha256)
            proof_hex = mac.hexdigest()

            data = await self._request("POST", "/api/v1/protocol/authenticate", {
                "session_id": self._session_id,
                "proof": proof_hex
            })

            resp = AuthResponse(**data)
            self._session_token = resp.payload.session_token
            self._state = "SESSION_ACTIVE"
            return resp

        finally:
            if hasattr(self, '_shared_secret'):
                self._shared_secret = None
                del self._shared_secret
            self._challenge_nonce = None

    def get_session(self) -> Optional[str]:
        return self._session_token

    def terminate_session(self):
        self._reset_state()
