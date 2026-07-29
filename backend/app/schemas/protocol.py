from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
from enum import Enum

class ProtocolStatus(str, Enum):
    """Status of an authentication or protocol session."""
    AUTHENTICATED = "authenticated"
    REJECTED = "rejected"
    PENDING = "pending"

class ProtocolVersion(BaseModel):
    """Qinert Protocol Version information."""
    version: str = Field(..., description="Semantic version of the Qinert protocol", examples=["1.0.0"])
    supported_versions: List[str] = Field(..., description="List of supported protocol versions", examples=[["1.0.0", "1.1.0"]])
    capabilities: List[str] = Field(default_factory=list, description="Supported protocol capabilities")

class HandshakeRequest(BaseModel):
    """Initial handshake request from a client."""
    client_id: str = Field(..., description="Unique identifier of the client initiating the handshake")
    username: str = Field(..., description="Requested identity for authentication")
    requested_version: str = Field(..., description="The protocol version the client wants to use")
    supported_algorithms: List[str] = Field(..., description="Quantum key distribution algorithms supported by the client (e.g., bb84)")

class HandshakeResponse(BaseModel):
    """Server response to a handshake request."""
    session_id: str = Field(..., description="Unique session identifier for the handshake")
    accepted_version: str = Field(..., description="The agreed upon protocol version")
    selected_algorithm: str = Field(..., description="The QKD algorithm selected by the server")
    server_public_key: str = Field(..., description="Server's classical public key for initial classical verification")
    challenge_nonce: str = Field(..., description="Random challenge string to be signed by the derived quantum key")
    expires_at: datetime = Field(..., description="When this handshake session expires")
    simulation_details: Optional[Dict[str, Any]] = Field(None, description="Detailed execution state of the quantum simulation")

class AuthenticationRequest(BaseModel):
    """Request to authenticate a session using a derived quantum key."""
    session_id: str = Field(..., description="The active session identifier")
    proof: str = Field(..., description="The cryptographic proof of the shared quantum key")

class AuthenticationResponse(BaseModel):
    """Result of the authentication attempt."""
    session_id: str = Field(..., description="The session identifier")
    status: ProtocolStatus = Field(..., description="Authentication status")
    session_token: Optional[str] = Field(None, description="An opaque protocol token for subsequent requests (not a JWT)")
    message: str = Field(..., description="Human-readable status message")

class Session(BaseModel):
    """Represents an active protocol session."""
    session_id: str
    client_id: str
    username: str
    status: ProtocolStatus
    created_at: datetime
    expires_at: datetime

class SharedSecret(BaseModel):
    """Represents the classical manifestation of the quantum shared secret (for mock/demo purposes)."""
    session_id: str
    key_material_hash: str = Field(..., description="Hash of the derived key material")
    bit_length: int = Field(..., description="Length of the shared secret in bits")

class ProtocolError(BaseModel):
    """Standardized error format for the Qinert protocol."""
    error_code: str = Field(..., description="A unique code identifying the error type (e.g., 'ERR_UNSUPPORTED_VERSION')")
    message: str = Field(..., description="Human-readable error description")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional context about the error")

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "error_code": "ERR_INVALID_PROOF",
            "message": "The provided authentication proof was invalid or malformed.",
            "details": {"attempt": 1}
        }
    })
