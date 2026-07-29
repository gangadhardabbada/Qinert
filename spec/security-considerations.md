# QPS 1.0 Security Considerations

## 1. Transport Layer Security

QPS/1.0 standardizes the authentication protocol structure but MUST NOT be executed over an unencrypted classical channel.
**TLS (Transport Layer Security) 1.2 or higher is REQUIRED** for all web transport of QPS messages. Classical channel authentication is required to prevent a classical Man-in-the-Middle (MITM) from modifying the public basis reconciliation data.

## 2. Authentication Proof & Cryptography

Implementations MUST NOT invent custom cryptographic primitives.
- The proof of possession MUST be constructed using **HMAC-SHA-256** (or stronger standard hashes like SHA-384).
- The Server MUST perform a **constant-time comparison** of the received HMAC against the expected HMAC to prevent timing attacks.
- The `challenge_nonce` MUST contain at least 128 bits of cryptographic entropy and MUST NOT be predictable.

## 3. Replay Prevention and Expiration

- Challenge nonces MUST be tracked by the Server. A Server MUST reject any `AuthenticationProof` that uses a previously consumed nonce (Replay Attack Prevention).
- Challenges MUST expire (e.g., within 5 minutes). A `QPS-3001 CHALLENGE_EXPIRED` error MUST be emitted if the proof is submitted after the deadline.
- Session Tokens MUST expire and SHOULD NOT have a lifespan exceeding standard security policies (e.g., 1 hour).

## 4. Secret Lifecycle

- The Shared Secret established via Key Establishment MUST be stored securely in ephemeral memory.
- The Shared Secret MUST be zeroized/destroyed immediately after verifying the Authentication Proof.
- Database restrictions: The Shared Secret MUST NOT be written to persistent storage (e.g., relational databases, logs) under any circumstances.

## 5. QBER Interpretation & DOS

- QBER evaluation protects against eavesdroppers. However, high QBER can also result from environmental noise.
- Implementations SHOULD implement rate-limiting to prevent Denial of Service (DoS) attacks where an attacker intentionally injects noise to force continuous `FAILED` states.

## 6. Physical Quantum Simulation Disclaimer

**CRITICAL:** Qiskit/Aer simulation does NOT constitute physical QKD.

Running quantum circuits on classical hardware (or even on general-purpose quantum computing hardware) does NOT automatically create a real quantum communication channel between a client and a server.
Real QKD requires appropriate physical quantum optical networking infrastructure to transport polarized photons between distinct physical endpoints. QPS/1.0 on a classical web stack simulates this for protocol testing and authentication architecture validation.
