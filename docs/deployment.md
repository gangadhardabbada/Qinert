# Deployment

## Prerequisites
- Node.js (v18+)
- Python (3.12+)
- PostgreSQL database (e.g., Neon serverless Postgres)
- IBM Quantum Account API Token (for hardware execution)

## Environment Configuration

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://user:pass@ep-rest-of-url.neon.tech/neondb
QISKIT_IBM_TOKEN=your_ibm_quantum_token
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Running Locally (Development)

**1. Start the Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**2. Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Production Considerations
- **Backend**: Deploy behind a reverse proxy (Nginx, Traefik) using Gunicorn with Uvicorn workers.
- **Frontend**: Build static assets (`npm run build`) and serve via a CDN or static file server.
- **Security**: HTTPS is **strictly required** in production to prevent Man-in-the-Middle attacks on the initial basis exchange, even though the shared key itself is never transmitted.
