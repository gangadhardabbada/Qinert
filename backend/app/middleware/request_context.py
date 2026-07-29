import uuid
import contextvars
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.constants import HEADER_REQUEST_ID

# Context variable to store the request ID for the current async context
request_id_ctx_var: contextvars.ContextVar[str] = contextvars.ContextVar("request_id", default="")

class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Generate or extract request ID
        req_id = request.headers.get(HEADER_REQUEST_ID, f"req_{uuid.uuid4().hex}")
        
        # Set it in context
        token = request_id_ctx_var.set(req_id)
        
        # Make request_id accessible in request state
        request.state.request_id = req_id
        
        response = await call_next(request)
        
        # Inject back into headers
        response.headers[HEADER_REQUEST_ID] = req_id
        
        # Reset context var
        request_id_ctx_var.reset(token)
        
        return response
