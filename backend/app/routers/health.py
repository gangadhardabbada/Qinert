from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.schemas.response import StandardResponse
from app.middleware.request_context import request_id_ctx_var
from app.core.database import get_db

router = APIRouter()

@router.get("/health", response_model=StandardResponse[dict], summary="Check system health")
async def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint to verify that the API is up and running.
    """
    req_id = request_id_ctx_var.get()
    
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"
        
    return StandardResponse(
        request_id=req_id,
        status="success",
        payload={
            "status": "healthy", 
            "database": db_status,
            "protocol": "QPS/1.0"
        }
    )
