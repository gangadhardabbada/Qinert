# QPS/1.0 Protocol

## Overview
The **Quantum Protocol for Security (QPS)** Version 1.0 is the proprietary application-layer protocol defining how Qinert clients and servers negotiate a quantum-secured authentication session.

## Core Tenets
1. **Never transmit the shared key**: The quantum-derived key is used strictly for local Proof-of-Possession calculations.
2. **QBER Validation**: Keys are immediately discarded if the Quantum Bit Error Rate (QBER) exceeds the strict security threshold (default 11%).
3. **Stateless Handshakes**: The challenge/response flow avoids prolonged state caching, utilizing strict expiry windows.

## Protocol Flow

```mermaid
sequenceDiagram
    participant Client
    participant Server (FastAPI)
    participant QPU (Engine)

    Client->>Server: 1. QPS Init (Client ID, Engine)
    Server-->>Client: 2. Alice Bits & Bases
    
    Client->>QPU: 3. Encode & Transmit
    QPU-->>Server: 4. Quantum States Received
    
    Server->>QPU: 5. Measure States
    Server->>Server: 6. Sift & Calc QBER
    
    alt QBER > 11%
        Server-->>Client: 7a. Error (Eavesdropping / Noise)
    else QBER <= 11%
        Server->>Server: 7b. Generate HMAC Challenge
        Server-->>Client: 8. Challenge Payload
        
        Client->>Client: 9. Calc Proof (HMAC-SHA256)
        Client->>Server: 10. Submit Proof
        
        Server->>Server: 11. Verify Proof
        Server-->>Client: 12. Session Established (Token)
    end
```

## Security Thresholds
- Maximum acceptable QBER: `0.11` (11%)
- Challenge Expiry: `60 seconds`
- Proof algorithm: `HMAC-SHA-256`
