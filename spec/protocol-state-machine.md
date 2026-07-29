# QPS 1.0 Protocol State Machine

## 1. Normative States

A Qinert Session MUST exist in exactly one of the following states at any given time:

* `INITIAL`: The starting state before any protocol interaction has occurred.
* `IDENTIFIED`: The Client has initiated a connection and stated their identity and capabilities.
* `KEY_ESTABLISHING`: Quantum transmission and classical sifting are actively occurring.
* `KEY_ESTABLISHED`: A Shared Secret has been successfully derived, and QBER is within acceptable bounds.
* `PROOF_PENDING`: The Server has issued a cryptographic challenge and is awaiting the Client's proof of possession.
* `PROOF_VERIFIED`: The Server has successfully validated the Client's proof against the Shared Secret.
* `AUTHENTICATED`: Final token issuance is complete.
* `SESSION_ACTIVE`: The Client is actively using the Session Token for authorized communication.
* `TERMINATED`: The session has ended gracefully or expired.
* `FAILED`: The protocol was aborted due to errors, security bounds (e.g., QBER), or invalid proofs.

## 2. Valid Transitions

Implementations MUST enforce the following state machine transitions:

1. `INITIAL` -> `IDENTIFIED` (via ProtocolInitiationRequest)
2. `IDENTIFIED` -> `KEY_ESTABLISHING` (via Key Establishment initiation)
3. `KEY_ESTABLISHING` -> `KEY_ESTABLISHED` (via successful Sifting and QBER validation)
4. `KEY_ESTABLISHED` -> `PROOF_PENDING` (via AuthenticationChallenge issuance)
5. `PROOF_PENDING` -> `PROOF_VERIFIED` (via successful AuthenticationProof)
6. `PROOF_VERIFIED` -> `AUTHENTICATED` (via SessionResponse)
7. `AUTHENTICATED` -> `SESSION_ACTIVE` (via Client utilization)
8. `SESSION_ACTIVE` -> `TERMINATED` (via logout or timeout)

**Failure Transitions:**
Any state MAY transition directly to `FAILED` if a protocol error, timeout, or security violation occurs.
A transition to `FAILED` is terminal. The session MUST NOT be reused.

## 3. Invalid Transitions

If a Client or Server attempts to perform an action or send a message that violates the defined transitions (e.g., sending an `AuthenticationProof` while in the `IDENTIFIED` state), the receiving party MUST immediately abort the session, transition to `FAILED`, and produce a `QPS-1100 INVALID_STATE` protocol error.
