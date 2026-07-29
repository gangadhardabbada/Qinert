from typing import List, Optional
from pydantic import BaseModel, Field

class SimulationDetails(BaseModel):
    final_hex_key: str

class HandshakePayload(BaseModel):
    session_id: str
    challenge_nonce: str
    expires_at: str
    simulation_details: SimulationDetails

class HandshakeResponse(BaseModel):
    status: str
    payload: HandshakePayload

class AuthPayload(BaseModel):
    session_id: str
    session_token: str
    expires_at: str

class AuthResponse(BaseModel):
    status: str
    payload: AuthPayload
