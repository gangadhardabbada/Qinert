from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Qinert"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173", # Vite default
        "http://localhost:3000",
        "http://127.0.0.1:5173"
    ]
    
    # Algorithm Settings
    DEFAULT_ALGORITHM: str = "bb84"
    QUANTUM_ENGINE: str = "classical"  # can be "classical" or "qiskit"

    # Database
    DATABASE_URL: str = "postgresql+psycopg://user:password@localhost/dbname"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
