# QPS 1.0 Message Formats

All QPS/1.0 messages MUST be serialized as JSON.

## 1. Standard Metadata

Every protocol message MUST contain the following metadata envelope:

```json
{
  "protocol": "qps",
  "version": "1.0",
  "request_id": "uuid-string",
  "timestamp": "ISO-8601-string",
  "type": "Message-Type"
}
```

## 2. Canonical Message Types

### ProtocolInitiationRequest

Sent by the Client to begin a session.

```json
{
  "type": "ProtocolInitiationRequest",
  "client_id": "string",
  "supported_algorithms": ["bb84"]
}
```

### ProtocolInitiationResponse

Sent by the Server to accept initiation.

```json
{
  "type": "ProtocolInitiationResponse",
  "session_id": "string",
  "selected_algorithm": "bb84"
}
```

### HandshakeRequest

Initiates Key Establishment and transfers classical sifting data (bases, measurements).

```json
{
  "type": "HandshakeRequest",
  "session_id": "string",
  "alice_bases": ["+"],
  "measured_bits": [0]
}
```

### HandshakeResponse

Returns the Server's sifting data and the computed QBER. 
**Crucially, this response MUST NOT expose the raw Shared Secret.**

```json
{
  "type": "HandshakeResponse",
  "session_id": "string",
  "bob_bases": ["+"],
  "qber": 0.0,
  "is_secure": true
}
```

### AuthenticationChallenge

Sent by the Server to demand proof of possession.

```json
{
  "type": "AuthenticationChallenge",
  "session_id": "string",
  "challenge_nonce": "hex-string",
  "expires_at": "ISO-8601-string"
}
```

### AuthenticationProof

Sent by the Client, containing the HMAC signature.

```json
{
  "type": "AuthenticationProof",
  "session_id": "string",
  "proof": "hex-hmac-string"
}
```

### AuthenticationResponse & SessionResponse

Returned by the Server upon successful proof verification.

```json
{
  "type": "SessionResponse",
  "session_id": "string",
  "session_token": "jwt-string",
  "expires_at": "ISO-8601-string"
}
```

### ProtocolError

Returned when a violation or failure occurs.

```json
{
  "type": "ProtocolError",
  "error_code": "QPS-XXXX",
  "error_description": "Human readable description"
}
```
