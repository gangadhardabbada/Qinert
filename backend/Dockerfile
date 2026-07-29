FROM python:3.12-slim
WORKDIR /app

# Install system dependencies if required (e.g. for cryptography/psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install gunicorn for production deployment
RUN pip install gunicorn uvicorn[standard]

COPY . .

# Run with Gunicorn using Uvicorn workers
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
