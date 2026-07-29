from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import uuid

from app.schemas.protocol import (
    HandshakeRequest,
    HandshakeResponse,
    AuthenticationRequest,
    AuthenticationResponse,
    ProtocolVersion,
    ProtocolStatus
)
from app.schemas.response import StandardResponse
from app.core.errors import ProtocolErrorCode
from app.middleware.request_context import request_id_ctx_var
from app.quantum.protocol import BB84Protocol
from app.quantum.engine import QuantumEngine
from app.quantum.factory import get_quantum_engine
from app.services.authentication import AuthenticationService
from app.core.database import get_db
from app.repositories import UserRepository, SessionRepository, AuthLogRepository

router = APIRouter()

router = APIRouter()

@router.get("/version", response_model=StandardResponse[ProtocolVersion], summary="Get Protocol Version")
async def get_protocol_version():
    """
    Returns the supported versions and capabilities of the Qinert Protocol.
    """
    req_id = request_id_ctx_var.get()
    payload = ProtocolVersion(
        version="1.0.0",
        supported_versions=["1.0.0"],
        capabilities=["bb84-key-exchange", "classical-verification"]
    )
    return StandardResponse(request_id=req_id, status="success", payload=payload)

@router.post("/handshake", response_model=StandardResponse[HandshakeResponse], summary="Initiate Protocol Handshake")
async def initiate_handshake(
    request: HandshakeRequest,
    req: Request,
    db: Session = Depends(get_db),
    engine: QuantumEngine = Depends(get_quantum_engine)
):
    """
    Initiates a new Qinert protocol session and negotiates the algorithm and version.
    """
    req_id = request_id_ctx_var.get()
    
    if request.requested_version not in ["1.0.0"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error_code": ProtocolErrorCode.UNSUPPORTED_VERSION, "message": "Requested protocol version is not supported."}
        )

    # 1. Identity Verification
    user_repo = UserRepository(db)
    auth_log_repo = AuthLogRepository(db)
    
    # Auto-create mock user if it doesn't exist just for the reference implementation demo
    user = user_repo.get_by_username(request.username)
    if not user and request.username.lower() in ["alice", "bob", "demo_user"]:
        user = user_repo.create_user(request.username)
            
    if not user or not user.is_active:
        auth_log_repo.log_event("HANDSHAKE_FAILED")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error_code": ProtocolErrorCode.UNAUTHORIZED, "message": "Identity verification failed or user is inactive."}
        )

    session_id = f"sess_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    challenge_nonce = uuid.uuid4().hex
    
    demo_action = req.headers.get("X-Qinert-Demo-Action", "").lower()
    is_simulation = req.headers.get("X-Qinert-Simulate", "").lower() == "true"
    
    # Execute full BB84 simulation using the abstract protocol orchestrator
    # and the injected quantum engine backend.
    simulate_eavesdropper = (demo_action == "eavesdrop" and is_simulation)
    simulator = BB84Protocol(engine=engine, num_qubits=256) # Reasonable size for a handshake demo
    simulation_results = simulator.execute_exchange(simulate_eavesdropper=simulate_eavesdropper)
    
    # Store session state for the authentication phase
    final_key = simulation_results.get("final_hex_key")
    qber = simulation_results.get("qber")
    if not final_key:
        auth_log_repo.log_event("QBER_THRESHOLD_EXCEEDED", qber=qber)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error_code": ProtocolErrorCode.QBER_TOO_HIGH, "message": "QBER threshold exceeded. Key distribution failed."}
        )
    # Conditionally remove final_hex_key to comply with QPS-1.0 Category 20
    if req.headers.get("X-Qinert-Simulate", "").lower() != "true":
        simulation_results.pop("final_hex_key", None)
        
    session_repo = SessionRepository(db)
    # Artificially expire the session for testing
    if demo_action == "expired" and is_simulation:
        expires_at = datetime.now(timezone.utc) - timedelta(hours=1)
        
    session_repo.create_handshake_session(
        session_id=session_id,
        user_id=user.id,
        client_id=request.client_id,
        username=request.username,
        protocol_version=request.requested_version,
        key=final_key,
        challenge=challenge_nonce,
        expires_at=expires_at
    )
    
    auth_log_repo.log_event("HANDSHAKE_SUCCESS", session_id=session_id, qber=qber)
    
    payload = HandshakeResponse(
        session_id=session_id,
        accepted_version="1.0.0",
        selected_algorithm=request.supported_algorithms[0] if request.supported_algorithms else "bb84",
        server_public_key="pub_mock_" + uuid.uuid4().hex,
        challenge_nonce=challenge_nonce,
        expires_at=expires_at,
        simulation_details=simulation_results
    )
    return StandardResponse(request_id=req_id, status="success", payload=payload)

@router.post("/authenticate", response_model=StandardResponse[AuthenticationResponse], summary="Authenticate Session")
async def authenticate_session(request: AuthenticationRequest, db: Session = Depends(get_db)):
    """
    Authenticates a session by verifying the cryptographic proof generated from the shared quantum key.
    """
    req_id = request_id_ctx_var.get()
    
    if not request.proof:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error_code": ProtocolErrorCode.INVALID_PROOF, "message": "Proof is missing or malformed."}
        )

    # 1. Retrieve session
    session_repo = SessionRepository(db)
    auth_log_repo = AuthLogRepository(db)
    
    session_data = session_repo.get_by_session_id(request.session_id)
    if not session_data:
        auth_log_repo.log_event("AUTH_FAILED", session_id=request.session_id)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error_code": "QPS-1100", "message": "Invalid state: Handshake required before authentication."}
        )
        
    # Check if session is still pending and challenge exists (it wasn't already authenticated)
    if not session_data.key or not session_data.challenge or session_data.status == ProtocolStatus.AUTHENTICATED:
        auth_log_repo.log_event("AUTH_FAILED", session_id=request.session_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error_code": "QPS-3002", "message": "Replay detected or challenge already consumed."}
        )
        
    # Python datetimes from DB have timezone info (DateTime(timezone=True)). 
    # Use timezone-aware comparison.
    if datetime.now(session_data.expires_at.tzinfo) > session_data.expires_at:
        session_repo.delete_session(session_data)
        auth_log_repo.log_event("AUTH_FAILED", session_id=request.session_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error_code": ProtocolErrorCode.SESSION_EXPIRED, "message": "Session has expired."}
        )

    # 2. Verify Cryptographic Proof
    is_valid = AuthenticationService.verify_hmac_proof(
        expected_key=session_data.key,
        challenge=session_data.challenge,
        provided_proof=request.proof
    )
    
    if not is_valid:
        session_repo.delete_session(session_data)
        auth_log_repo.log_event("AUTH_FAILED", session_id=request.session_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error_code": ProtocolErrorCode.INVALID_PROOF, "message": "Authentication proof verification failed."}
        )

    # 3. Mark Authenticated and Issue Token
    session_repo.mark_authenticated(session_data)
    auth_log_repo.log_event("AUTH_SUCCESS", session_id=request.session_id)
    
    payload = AuthenticationResponse(
        session_id=request.session_id,
        status=ProtocolStatus.AUTHENTICATED,
        token=f"qt_{uuid.uuid4().hex}",
        message="Quantum authentication successful."
    )
    
    return StandardResponse(request_id=req_id, status="success", payload=payload)
