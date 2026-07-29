# Qinert API Reference

Welcome to the complete API reference for Qinert. This document covers Authentication, Protocol, Experiment, Quantum, Session, and Health endpoints. All endpoints are prefixed with `/api/v1`.

---

## 1. Protocol APIs

### 1.1 Get Protocol Version
**Purpose:** Retrieves the current supported QPS (Quantum Protocol for Security) versions and capabilities.  
**HTTP Method:** `GET`  
**Endpoint:** `/api/v1/protocol/version`  
**Authentication Requirements:** None

**Request:** None

**Response:**
```json
{
  "request_id": "req-12345",
  "status": "success",
  "payload": {
    "version": "1.0.0",
    "supported_versions": ["1.0.0"],
    "capabilities": ["bb84-key-exchange", "classical-verification"]
  }
}
```

**Error Codes:**
- `500 Internal Server Error`: Server misconfiguration.

---

### 1.2 Protocol Handshake
**Purpose:** Initiates a new Qinert protocol session, negotiating algorithms, executing BB84 key exchange over the chosen quantum engine, and returning a cryptographic challenge.  
**HTTP Method:** `POST`  
**Endpoint:** `/api/v1/protocol/handshake`  
**Authentication Requirements:** None (Initial step)

**Request:**
```json
{
  "requested_version": "1.0.0",
  "client_id": "client_abc123",
  "username": "alice",
  "algorithms": ["HMAC-SHA256"]
}
```

**Response (Success):**
```json
{
  "request_id": "req-67890",
  "status": "success",
  "payload": {
    "session_id": "sess_uuid123",
    "challenge": "random_hex_nonce_string",
    "selected_algorithm": "HMAC-SHA256",
    "expires_in": 900
  }
}
```

**Error Codes:**
- `400 Bad Request`: QBER threshold exceeded (ProtocolErrorCode: QBER_TOO_HIGH), unsupported version.
- `403 Forbidden`: Identity verification failed.

---

## 2. Authentication APIs

### 2.1 Authenticate / Verify Proof
**Purpose:** Submits the Proof-of-Possession computed by hashing the server's challenge using the quantum-established shared key.  
**HTTP Method:** `POST`  
**Endpoint:** `/api/v1/protocol/authenticate`  
**Authentication Requirements:** Valid `session_id` from Handshake.

**Request:**
```json
{
  "session_id": "sess_uuid123",
  "client_id": "client_abc123",
  "proof": "sha256_hex_hash_string"
}
```

**Response (Success):**
```json
{
  "request_id": "req-54321",
  "status": "success",
  "payload": {
    "status": "AUTHENTICATED",
    "access_token": "jwt_or_secure_token",
    "token_type": "bearer",
    "expires_at": "2026-07-30T00:00:00Z"
  }
}
```

**Error Codes:**
- `401 Unauthorized`: Invalid proof (INVALID_PROOF), Expired challenge (CHALLENGE_EXPIRED), Replay detected.
- `404 Not Found`: Session ID not found.

---

### 2.2 Logout / Destroy Session
**Purpose:** Invalidates the current active session.  
**HTTP Method:** `POST`  
**Endpoint:** `/api/v1/auth/logout`  
**Authentication Requirements:** Valid Bearer token.

**Request:** None

**Response (Success):**
```json
{
  "request_id": "req-11111",
  "status": "success",
  "payload": {
    "status": "LOGGED_OUT"
  }
}
```

**Error Codes:**
- `401 Unauthorized`: Missing or invalid session token.

---

## 3. Experiment & Quantum APIs

### 3.1 Run BB84 Experiment
**Purpose:** Initiates a comprehensive BB84 validation run across selected quantum engines to observe physical/simulated behavior.  
**HTTP Method:** `POST`  
**Endpoint:** `/api/v1/experiments/bb84`  
**Authentication Requirements:** Valid Bearer token.

**Request:**
```json
{
  "engines": ["classical", "qiskit_aer", "ibm_quantum"],
  "mode": "noise",
  "trials": 5,
  "number_of_bits": 256,
  "shots": 128,
  "noise_params": {
    "measurement_error_rate": 0.1
  }
}
```

**Response:**
```json
{
  "experiment_id": "exp_uuid456"
}
```

**Error Codes:**
- `422 Unprocessable Entity`: Invalid request schema (e.g., bits > limit).
- `401 Unauthorized`: Missing or invalid session token.

---

### 3.2 Get Experiment Status
**Purpose:** Polls the status of a specific experiment ID.  
**HTTP Method:** `GET`  
**Endpoint:** `/api/v1/experiments/{experiment_id}`  
**Authentication Requirements:** Valid Bearer token.

**Request:** None (Path parameter)

**Response:**
```json
{
  "experiment_id": "exp_uuid456",
  "status": "RUNNING",
  "label": null,
  "created_at": "2026-07-29T11:00:00Z",
  "results": [
    {
      "engine": "classical",
      "backend": "local_python",
      "status": "COMPLETED",
      "job_id": null,
      "sifted_key_length": 124,
      "error_count": 0,
      "qber": 0.0,
      "mean_qber": 0.0,
      "std_dev_qber": 0.0,
      "trial_count": 5,
      "execution_time_ms": 12,
      "error_message": null,
      "eve_bases": null,
      "eve_measured_bits": null
    }
  ]
}
```

**Error Codes:**
- `404 Not Found`: Experiment not found.

---

### 3.3 Get Experiment Comparison
**Purpose:** Retrieves aggregated, detailed comparisons of all engines involved in the experiment, automatically syncing pending asynchronous quantum hardware jobs.  
**HTTP Method:** `GET`  
**Endpoint:** `/api/v1/experiments/{experiment_id}/comparison`  
**Authentication Requirements:** Valid Bearer token.

**Request:** None (Path parameter)

**Response:**
```json
{
  "experiment_id": "exp_uuid456",
  "label": null,
  "mode": "noise",
  "trials": 5,
  "number_of_bits": 256,
  "created_at": "2026-07-29T11:00:00Z",
  "engines": {
    "qiskit_aer": {
      "engine": "qiskit_aer",
      "backend": "aer_simulator",
      "status": "COMPLETED",
      "job_id": null,
      "sifted_key_length": 128,
      "error_count": 13,
      "qber": 0.101,
      "mean_qber": 0.103,
      "std_dev_qber": 0.005,
      "trial_count": 5,
      "execution_time_ms": 45,
      "error_message": null,
      "eve_bases": null,
      "eve_measured_bits": null
    }
  }
}
```

**Error Codes:**
- `404 Not Found`: Experiment not found.

---

## 4. Health APIs

### 4.1 System Health
**Purpose:** Checks the basic health of the backend application and its connection to the database.  
**HTTP Method:** `GET`  
**Endpoint:** `/api/v1/health`  
**Authentication Requirements:** None

**Request:** None

**Response:**
```json
{
  "request_id": "req-99999",
  "status": "success",
  "payload": {
    "status": "ok",
    "database": "connected"
  }
}
```

**Error Codes:**
- `500 Internal Server Error`: Database connectivity lost.
