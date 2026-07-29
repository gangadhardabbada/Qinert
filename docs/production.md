# Qinert Production Deployment Guide

## 1. Environment Separation
Maintain at least two completely isolated environments:
- **Staging**: Mirrors production. Used for final QA and integration testing (e.g., testing IBM QPU integration without exhausting production credits).
- **Production**: Live environment. Strictly isolated database and network boundary. 
Use separate branches and `.env` files for each.

## 2. HTTPS Configuration
Qinert **requires** HTTPS in production to prevent Man-in-the-Middle (MitM) attacks during the classical communication phase of BB84 (basis exchange).
- NGINX is configured to force HTTP to HTTPS redirects (`return 301`).
- Mount valid SSL certificates (e.g., Let's Encrypt / Certbot) to `./certs` before starting `docker-compose`.

## 3. Secrets Management
Never commit `.env` files to version control.
- Use a robust secrets manager (e.g., HashiCorp Vault, AWS Secrets Manager, or GitHub Secrets for CI/CD).
- Required Production Secrets:
  - `DATABASE_URL` (Neon Postgres Connection String)
  - `QISKIT_IBM_TOKEN` (Real IBM Quantum Account Token)
  - `SECRET_KEY` (Used for JWT signing, if implemented in future iterations)

## 4. Logging and Monitoring
- **Docker Logging**: Configured in `docker-compose.yml` to use `json-file` with size rotation (`max-size: 200k`, `max-file: 10`) to prevent disk exhaustion.
- **Application Logging**: `app.core.logging` formats logs into JSON strings in production (`ENVIRONMENT=production`) to be parsed by tools like Datadog, ELK, or Grafana Loki.
- **Monitoring**: 
  - Track `QBER_TOO_HIGH` occurrences. A sustained spike across multiple users may indicate a systemic noise issue or an active interception attempt on your quantum channel.
  - Track `401 Unauthorized` metrics on `/api/v1/protocol/authenticate` to detect replay attacks.

## 5. Health Checks
- `docker-compose.yml` includes an explicit Docker health check polling `/api/v1/health` every 30 seconds.
- Orchestrators (like Kubernetes or AWS ECS) should use this endpoint to automatically restart failing backend instances.

## 6. Rate Limiting
- Defined at the NGINX level: `limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;`
- Protects the FastAPI backend from brute-force authentication attempts and DDoS attacks.
- Note: If deploying behind a load balancer (like AWS ALB), ensure `X-Forwarded-For` headers are properly parsed so rate-limiting applies per-client, not globally to the ALB's IP.

## 7. Backup Strategy
- **PostgreSQL (Neon)**: Neon provides point-in-time recovery automatically. For self-hosted Postgres, configure nightly `pg_dump` backups pushed to cold storage (e.g., Amazon S3).
- **Quantum Keys**: By design, raw quantum keys are transient and **must not be backed up**. They are discarded immediately after the session is verified.

## 8. Disaster Recovery (DR)
- **Database Failure**: Restore from the latest snapshot/WAL logs. Users will need to re-authenticate (sessions will be lost), but core identity data will be restored.
- **IBM QPU Outage**: The `IBMQuantumEngine` will throw an exception. The system should gracefully fail or allow administrators to disable the hardware engine, falling back to Qiskit Aer simulation for uninterrupted authentication.

## 9. Deployment Checklist
Before pressing deploy, ensure:
- [ ] Database credentials are secure and point to the production instance.
- [ ] The `QISKIT_IBM_TOKEN` is injected via CI/CD variables and is a production-tier account (if applicable).
- [ ] SSL certificates (`fullchain.pem` and `privkey.pem`) are present in the `certs/` volume.
- [ ] The API Base URL (`VITE_API_BASE_URL`) in the frontend `.env` points to the public HTTPS domain.
- [ ] Firewall rules restrict direct access to port 8000; all traffic must pass through the NGINX reverse proxy on ports 80/443.
