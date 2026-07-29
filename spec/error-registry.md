# QPS 1.0 Error Registry

QPS/1.0 defines a stable registry of protocol errors. These error codes decouple protocol semantics from underlying HTTP status codes, allowing QPS to be ported across different transports (WebSockets, gRPC, etc.).

## 1XXX Series: Request & State Errors

* **QPS-1000 INVALID_REQUEST**: The message payload was malformed, missing required fields, or failed schema validation.
* **QPS-1001 UNSUPPORTED_VERSION**: The requested protocol version is not supported by the Server.
* **QPS-1100 INVALID_STATE**: A message was received that violates the defined Protocol State Machine transitions.

## 2XXX Series: Key Establishment Errors

* **QPS-2000 KEY_ESTABLISHMENT_FAILED**: The Key Establishment mechanism failed unexpectedly (e.g., hardware fault).
* **QPS-2001 QBER_THRESHOLD_EXCEEDED**: The calculated QBER exceeds the maximum allowable bounds, indicating a noisy channel or active eavesdropper.

## 3XXX Series: Authentication Proof Errors

* **QPS-3000 INVALID_PROOF**: The submitted HMAC signature does not match the expected value derived from the Shared Secret.
* **QPS-3001 CHALLENGE_EXPIRED**: The Authentication Proof was submitted after the challenge time-to-live expired.
* **QPS-3002 REPLAY_DETECTED**: The Authentication Proof attempted to reuse a previously consumed challenge nonce.

## 4XXX Series: Session Errors

* **QPS-4000 SESSION_EXPIRED**: The requested operation failed because the active Session Token has expired.
* **QPS-4001 INVALID_SESSION**: The Session Token is invalid, revoked, or untrusted.

## 5XXX Series: Server Errors

* **QPS-5000 INTERNAL_ERROR**: The Server encountered an unexpected fault while executing the protocol.
