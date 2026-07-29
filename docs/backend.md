# Backend Documentation

## Framework
The Qinert backend is built on **FastAPI**, providing high performance, native asynchronous support, and automatic OpenAPI documentation generation.

## Component Layout
```text
backend/
├── app/
│   ├── core/           # Configuration and DB setup
│   ├── models/         # SQLAlchemy ORM models
│   ├── repositories/   # Data access layer (Repository Pattern)
│   ├── routers/        # FastAPI route definitions
│   ├── schemas/        # Pydantic validation schemas
│   ├── quantum/        # Quantum engines and BB84 logic
│   ├── experiments/    # Experimental lab runner and stats
│   └── main.py         # Application entry point
├── tests/              # Pytest suites
└── alembic/            # Database migrations
```

## Repository Pattern
Qinert utilizes the Repository pattern to isolate database interactions from business logic.
- `UserRepository`: Manages user credentials and lookups.
- `SessionRepository`: Handles session creation, validation, and expiry.
- `AuthLogRepository`: Audits authentication attempts (success/failure).
- `ExperimentRepository`: Tracks experimental lab runs and metrics.

## Dependency Injection
FastAPI's `Depends` is used heavily to inject database sessions (`get_db`) and service instances into route handlers, keeping the routing layer clean and testable.

## Error Handling
Custom exception handlers are implemented to translate internal business logic errors into standardized HTTP responses, ensuring the client receives clear, actionable feedback without leaking stack traces.
