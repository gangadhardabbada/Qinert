# Qinert Security Audit Report

This report outlines the security posture of the Qinert Authentication Platform (M12.3). The audit covers the QPS protocol implementation, infrastructure, and application logic. 

**Note:** No automated code modifications were made during this audit. Remediation requires manual implementation based on these recommendations.

---

## 1. Executive Summary
Qinert demonstrates a robust conceptual implementation of Quantum-Secured Proof-of-Possession authentication. The use of QBER thresholds (11%) effectively mitigates theoretical intercept-resend attacks. However, as an application moving toward production, several classical web security vulnerabilities and architectural risks must be addressed, particularly regarding CORS policies, state race conditions, and session storage.

---

## 2. Findings by Severity

### Critical Risk Findings
*(No Critical vulnerabilities identified in the current architecture that would allow immediate remote code execution or mass data exfiltration, provided HTTPS is enforced.)*

---

### High Risk Findings

#### H-1: Permissive CORS Configuration
- **Component:** API (`main.py` -> `CORSMiddleware`)
- **Description:** If the FastAPI CORS middleware is configured with `allow_origins=["*"]`, malicious third-party sites can make cross-origin requests to the API on behalf of authenticated users.
- **Remediation:** Strictly define `allow_origins` to match the exact production domain of the frontend (e.g., `["https://qinert-app.production.com"]`).

#### H-2: Man-in-the-Middle (MitM) on Classical Channel
- **Component:** QPS Protocol (Basis Exchange)
- **Description:** BB84 prevents interception of the quantum channel, but the classical channel (where bases are exchanged) is vulnerable to MitM if unencrypted. An attacker could impersonate Bob to Alice and Alice to Bob.
- **Remediation:** Enforce strict TLS (HTTPS) on all API traffic. The NGINX configuration must utilize `Strict-Transport-Security` (HSTS) and drop all plain HTTP traffic.

---

### Medium Risk Findings

#### M-1: Authentication Challenge Race Condition (Replay Risk)
- **Component:** Authentication (`POST /api/v1/auth/verify`)
- **Description:** While a random challenge nonce is used to prevent replay attacks, a race condition may exist if multiple rapid `/verify` requests are submitted with the same valid proof before the database can invalidate the challenge.
- **Remediation:** Ensure the database lookup and deletion of the challenge token is wrapped in a strict atomic transaction (`SELECT ... FOR UPDATE` or atomic `DELETE ... RETURNING`).

#### M-2: Session Token Storage (XSS Exposure)
- **Component:** Frontend Session Management
- **Description:** If the `access_token` returned by the server is stored in the browser's `localStorage` or `sessionStorage`, it is vulnerable to exfiltration via Cross-Site Scripting (XSS) attacks.
- **Remediation:** Transition to using `HttpOnly`, `Secure`, `SameSite=Strict` cookies for session management. The backend should set this cookie directly on the `/verify` response.

#### M-3: Unbounded QPU Quota Consumption
- **Component:** IBM Quantum Engine Integration
- **Description:** Malicious users could rapidly trigger experiments using the `ibm_quantum` engine, exhausting expensive IBM QPU quotas or queuing limits.
- **Remediation:** Implement application-layer rate limiting specific to the IBM Quantum endpoints (e.g., maximum 1 execution per hour per user).

---

### Low Risk Findings

#### L-1: Lack of Granular Authorization (RBAC)
- **Component:** API Endpoints
- **Description:** Any authenticated user can potentially access all experimental lab endpoints. 
- **Remediation:** Implement Role-Based Access Control (RBAC). Create a `roles` table and enforce scopes (e.g., `admin`, `researcher`, `user`) using FastAPI dependencies.

#### L-2: Missing CSRF Protection
- **Component:** API
- **Description:** If moving to Cookie-based session management (as recommended in M-2), the application becomes vulnerable to Cross-Site Request Forgery (CSRF).
- **Remediation:** Implement an Anti-CSRF token (e.g., `X-CSRF-Token` header) validated by a FastAPI middleware.

---

### Informational Findings

#### I-1: SQLAlchemy SQL Injection Defense
- **Component:** Database interactions
- **Finding:** The use of SQLAlchemy ORM inherently protects against traditional SQL injection. The only raw SQL observed is `SELECT 1` in the health check, which is safe.
- **Recommendation:** Maintain the strict policy of never interpolating untrusted strings into `text()` constructs.

#### I-2: Dependency Vulnerabilities
- **Component:** Environment
- **Finding:** Modern Python/Node.js ecosystems evolve rapidly.
- **Recommendation:** Integrate automated dependency scanning (e.g., `Dependabot` or `Snyk`) into the CI/CD pipeline to catch vulnerable sub-dependencies in `qiskit`, `fastapi`, or React UI libraries.

#### I-3: Secrets Leakage in Logs
- **Component:** `app.core.logging`
- **Finding:** Uncaught exceptions can occasionally dump local variables to the stack trace, potentially exposing `QISKIT_IBM_TOKEN` or `DATABASE_URL`.
- **Recommendation:** Utilize a logging filter to redact keys matching `*TOKEN*`, `*KEY*`, or `*PASSWORD*` before writing to `stdout`.

---

## 3. Recommended Remediation Roadmap

1. **Immediate (Pre-Production):**
   - Lock down CORS origins in `main.py`.
   - Implement atomic challenge invalidation to prevent replay race conditions.
   - Restrict the `ibm_quantum` engine behind strict rate limits.
2. **Short-Term (Next Release):**
   - Refactor frontend and backend to utilize `HttpOnly` cookies instead of JSON payload tokens.
   - Add CSRF middleware.
3. **Long-Term:**
   - Introduce RBAC for administrative control over the Experimental Lab.
   - Implement automated dependency and SAST (Static Application Security Testing) in GitHub Actions.
