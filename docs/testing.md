# Testing Strategy

Qinert employs a comprehensive, multi-layered testing strategy to ensure the integrity of the authentication flow and the accuracy of the quantum simulations.

## Backend Testing (Pytest)
Located in `backend/tests/`.

### 1. Unit Tests
- **Target**: Individual classes and utilities (e.g., `QBERCalculator`, `BasisSifter`).
- **Goal**: Ensure pure functions return expected results rapidly.

### 2. Quantum Engine Tests
- **Target**: `ClassicalEngine`, `QiskitEngine`, `IBMQuantumEngine`.
- **Goal**: Validate that encoded and measured states adhere to quantum mechanics (e.g., measuring in the wrong basis yields ~50% error rate).
- **Note**: The `IBMQuantumEngine` tests rely on mocking `qiskit_ibm_runtime` to prevent utilizing actual QPU time during CI pipelines.

### 3. API Integration Tests
- **Target**: FastAPI routers (`/api/v1/auth`, `/api/v1/experiments`).
- **Goal**: Verify end-to-end request handling, database interactions, and HTTP status codes using `httpx.AsyncClient`.

## Frontend Testing (Vitest & React Testing Library)
Located in `frontend/src/__tests__/`.
- Validates component rendering, state transitions, and context providers.
- Ensures the UI gracefully handles both successful authentication and QBER rejection states.

## Continuous Integration
Tests are configured to run on every commit. Deployment is blocked if the QPS authentication flow fails or if QBER calculations drift outside expected tolerances.
