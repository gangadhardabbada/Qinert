from fastapi import Request, status, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import logging

from app.schemas.response import StandardResponse
from app.core.errors import ProtocolErrorCode
from app.middleware.request_context import request_id_ctx_var

logger = logging.getLogger(__name__)

class QinertException(Exception):
    """Base exception for Qinert application."""
    def __init__(self, message: str, error_code: str = ProtocolErrorCode.INTERNAL_SERVER_ERROR, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR, details: dict = None):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)

async def qinert_exception_handler(request: Request, exc: QinertException):
    """Global handler for Qinert custom exceptions."""
    logger.error(f"App error on {request.url}: {exc.message}")
    req_id = request_id_ctx_var.get()
    
    response = StandardResponse(
        request_id=req_id,
        status="error",
        payload={
            "error_code": exc.error_code,
            "message": exc.message,
            "details": exc.details
        }
    )
    return JSONResponse(status_code=exc.status_code, content=response.model_dump(mode="json"))

async def http_exception_handler(request: Request, exc: HTTPException):
    """Global handler for standard HTTPExceptions."""
    req_id = request_id_ctx_var.get()
    payload = exc.detail if isinstance(exc.detail, dict) else {"message": str(exc.detail)}
    
    # Ensure error_code is present in payload if it's a dict
    if "error_code" not in payload:
        payload["error_code"] = ProtocolErrorCode.MALFORMED_REQUEST if exc.status_code == 400 else ProtocolErrorCode.INTERNAL_SERVER_ERROR
        
    response = StandardResponse(
        request_id=req_id,
        status="error",
        payload=payload
    )
    return JSONResponse(status_code=exc.status_code, content=response.model_dump(mode="json"))

async def global_exception_handler(request: Request, exc: Exception):
    """Global fallback exception handler."""
    logger.exception(f"Unhandled error on {request.url}")
    req_id = request_id_ctx_var.get()
    
    response = StandardResponse(
        request_id=req_id,
        status="error",
        payload={
            "error_code": ProtocolErrorCode.INTERNAL_SERVER_ERROR,
            "message": "Internal server error"
        }
    )
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=response.model_dump(mode="json"))

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    req_id = request_id_ctx_var.get()
    errors = exc.errors()
    # Provide a formatted list of the validation errors
    details = [{"loc": e["loc"], "msg": e["msg"], "type": e["type"]} for e in errors]
    
    response = StandardResponse(
        request_id=req_id,
        status="error",
        payload={
            "error_code": "QPS-1000",
            "message": "Malformed or invalid request payload.",
            "details": {"validation_errors": details}
        }
    )
    return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content=response.model_dump(mode="json"))
