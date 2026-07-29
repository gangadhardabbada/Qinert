# Security Model

Qinert is designed to demonstrate quantum-secure concepts while maintaining robust classical security for all non-quantum components.

## Threat Model & Mitigations

### 1. Eavesdropping (The Intercept-Resend Attack)
- **Threat**: An attacker (Eve) intercepts qubits, measures them, and forwards reprepaired qubits to the server.
- **Mitigation**: BB84 Protocol. By the No-Cloning Theorem, Eve cannot copy the unknown quantum states. Measuring them collapses the state, introducing an unavoidable ~25% error rate (QBER).
- **Enforcement**: Qinert strictly rejects any key exchange where `QBER > 11%`.

### 2. Replay Attacks
- **Threat**: An attacker captures a valid Authentication Proof and attempts to use it again later.
- **Mitigation**: Server-generated nonces (Challenges). A challenge is only valid once and expires quickly (60 seconds). A reused proof will fail because the challenge will no longer exist in the server cache.

### 3. Man-in-the-Middle (MitM)
- **Threat**: An attacker intercepts the classical communication channel (the bases and sifted bits).
- **Mitigation**: The QPS protocol must be run over TLS (HTTPS). While the shared key is never transmitted, the classical basis discussion must be authenticated to prevent an attacker from substituting their own bases.

### 4. Database Compromise
- **Threat**: An attacker gains read access to the PostgreSQL database.
- **Mitigation**: 
  - Passwords are bcrypt hashed.
  - The generated quantum keys are **never stored**. 
  - An attacker cannot retroactively decrypt past sessions because the keys were transient.

## Disclaimers
Qinert is an educational and experimental platform. The "IBM Quantum" execution uses real superconducting hardware, but the transmission occurs via internet APIs, not physical fiber-optic quantum channels. It demonstrates the *logic* of QKD, not the *physical* implementation of a quantum network.
