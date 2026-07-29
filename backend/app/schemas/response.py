from pydantic import BaseModel, Field
from typing import TypeVar, Generic, Optional, Any
from datetime import datetime

from app.core.constants import PROTOCOL_IDENTIFIER, PROTOCOL_VERSION

T = TypeVar("T")

class StandardResponse(BaseModel, Generic[T]):
    """
    The standard response envelope for every Qinert Protocol endpoint.
    """
    protocol: str = Field(default=PROTOCOL_IDENTIFIER, description="The protocol identifier")
    version: str = Field(default=PROTOCOL_VERSION, description="The semantic version of the protocol")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Server timestamp of the response")
    request_id: str = Field(..., description="Unique identifier for the request trace")
    status: str = Field(..., description="Status of the request: 'success' or 'error'")
    payload: Optional[T] = Field(None, description="The actual response data or error details")
