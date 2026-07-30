import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.database import engine
from sqlalchemy import text
from app.core.exceptions import (
    QinertException, 
    qinert_exception_handler, 
    global_exception_handler, 
    http_exception_handler,
    validation_exception_handler
)
from app.middleware.request_context import RequestContextMiddleware
from app.routers import health, auth, protocol, quantum, experiments, qonsole
from fastapi.exceptions import RequestValidationError, HTTPException
from fastapi.responses import JSONResponse

# Setup application logging
setup_logging()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info(f"Starting {settings.PROJECT_NAME} API v{settings.VERSION}")
    
    # Test DB connection
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Successfully connected to the PostgreSQL database.")
    except Exception as e:
        logger.error(f"Failed to connect to the database: {e}")
        
    yield
    # Shutdown actions
    logger.info(f"Shutting down {settings.PROJECT_NAME} API")

def create_app() -> FastAPI:
    app = FastAPI(
        title="Qinert Protocol Reference Implementation",
        description="The definitive reference implementation for the Qinert Quantum Key Distribution (QKD) Protocol API.",
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan,
        contact={
            "name": "Qinert Protocol Team",
            "url": "https://github.com/qinert-protocol",
        },
        license_info={
            "name": "MIT",
        },
        openapi_tags=[
            {"name": "protocol", "description": "Core protocol operations (handshake, authenticate, etc.)"},
            {"name": "health", "description": "Health checks for API monitoring"}
        ]
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request ID Middleware
    app.add_middleware(RequestContextMiddleware)

    # Register Exception Handlers
    app.add_exception_handler(QinertException, qinert_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, global_exception_handler)

    # Register Routers
    app.include_router(health.router, prefix=settings.API_V1_STR, tags=["health"])
    app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
    app.include_router(protocol.router, prefix=f"{settings.API_V1_STR}/protocol", tags=["protocol"])
    app.include_router(quantum.router, prefix=f"{settings.API_V1_STR}/quantum", tags=["quantum"])
    app.include_router(experiments.router, prefix=f"{settings.API_V1_STR}/experiments", tags=["experiments"])
    app.include_router(qonsole.router, prefix=f"{settings.API_V1_STR}/qonsole", tags=["qonsole"])

    return app

app = create_app()
