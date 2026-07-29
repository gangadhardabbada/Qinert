# Qinert Architecture Overview

## Introduction
Qinert is a modern quantum-secured authentication platform that demonstrates Quantum Key Distribution (QKD) concepts (specifically BB84) within a practical client-server architecture. It features a React-based frontend, a FastAPI backend, and multi-engine quantum simulation and execution capabilities, all communicating via the Quantum Protocol for Security (QPS/1.0).

## High-Level Architecture

```mermaid
graph TD
    Client[Client Browser (React + HeroUI)] -->|HTTPS / QPS| API[FastAPI Backend]
    API --> DB[(Neon PostgreSQL)]
    
    API --> Auth[Authentication Service]
    API --> Exp[Experimental Validation Lab]
    
    Auth --> QE[Quantum Engines]
    Exp --> QE
    
    QE --> Classical[Classical Simulator]
    QE --> Aer[Qiskit Aer Simulator]
    QE --> IBM[IBM Quantum Hardware]
```

## Core Components
1. **Frontend**: Built with React, Vite, Tailwind CSS, and Framer Motion. Provides a rich, dynamic user interface for authentication and the BB84 Experimental Lab.
2. **Backend**: A robust FastAPI application that handles routing, authentication logic, database interactions, and quantum engine orchestration.
3. **Database**: PostgreSQL (hosted on Neon) managed via SQLAlchemy and Alembic for persistence of user data, sessions, and experiment metrics.
4. **Quantum Engines**: An abstracted interface allowing BB84 execution over multiple backends (Classical, Aer, IBM).
5. **QPS/1.0**: The proprietary protocol governing the key establishment, challenge generation, and authentication proof steps.

## Directory Structure
- `frontend/`: React single-page application.
- `backend/`: FastAPI server and tests.
- `packages/`: Standalone SDKs (`qinert-js`, `qinert-python`) and shared logic.
- `docs/`: Technical documentation.
