# Qinert Protocol Specification (QPS) 1.0

## 1. Scope

The Qinert Protocol Specification (QPS) version 1.0 defines an experimental quantum-assisted authentication workflow. In this workflow, a key-establishment mechanism (such as QKD) provides secret cryptographic material that is immediately consumed within an authentication proof.

**Disclaimer:** QPS/1.0 is an experimental and open specification designed for demonstration and research purposes. It is **NOT** an established industry standard or a certified cryptographic standard.

QPS/1.0 standardizes the message formats, state transitions, and cryptographic proof constructs required to authenticate a client to a server using a quantum-derived shared secret. It explicitly **does not** standardize physical optical hardware, hardware-specific drivers, or lower-level transport layer security (TLS), which are assumed to exist as prerequisites or separate layers.

## 2. Terminology

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED",  "MAY", and "OPTIONAL" in this document are to be interpreted as described in RFC 2119.

* **Client**: The entity initiating the Qinert Protocol and seeking authentication.
* **Authorization/Authentication Server**: The entity verifying the Client's identity and providing the Session Token.
* **Qinert Session**: A logical, stateful connection between the Client and Server, identified by a Session Token.
* **Handshake**: The initial negotiation phase where the Client and Server agree on protocol versions and cryptographic algorithms.
* **Key Establishment**: The process by which the Client and Server derive a Shared Secret. QPS separates this abstract concept from its specific implementation profile (e.g., BB84).
* **Shared Secret**: The symmetric, secret cryptographic key established during Key Establishment.
* **Authentication Proof**: A cryptographic structure (e.g., HMAC) proving possession of the Shared Secret over a Server-provided challenge.
* **QBER (Quantum Bit Error Rate)**: The ratio of errors detected in the quantum channel, used to bound the information leaked to an eavesdropper.
* **Quantum Engine**: The abstract hardware or software mechanism responsible for generating, transmitting, and measuring quantum states.
* **Protocol Version**: The version of QPS being executed (e.g., "1.0").
* **Session Token**: A bearer token (e.g., JWT) granted upon successful authentication, used for subsequent authorized requests.

## 3. Protocol Flow

The typical QPS/1.0 flow is strictly sequential:

1. **Initiation**: The Client requests a session.
2. **Identification**: The Server identifies the Client (if applicable).
3. **Key Establishment**: The Client and Server perform quantum transmission and classical sifting to form a candidate key.
4. **QBER / Security Validation**: The Server and Client estimate channel noise. If the QBER exceeds the threshold, the protocol aborts.
5. **Authentication Challenge**: The Server generates a random nonce and sends it to the Client.
6. **Proof of Possession**: The Client signs the challenge using the Shared Secret.
7. **Proof Verification**: The Server verifies the signature using its copy of the Shared Secret.
8. **Session Establishment**: The Server issues a Session Token.
9. **Authenticated Communication**: The Client uses the Session Token for standard classical requests.

## 4. BB84 Profile

QPS/1.0 separates the core authentication loop from the Key Establishment profile.

The initial and primary profile for QPS/1.0 is **BB84**. Under the BB84 profile, the Key Establishment phase MUST consist of Alice (the Client) preparing qubits in random mutually unbiased bases, Bob (the Server) measuring them, and a subsequent public basis-reconciliation (sifting) phase.

Future profiles (e.g., E91, B92) MAY be added without requiring a redesign of the QPS core authentication state machine.

## 5. QBER Evaluation

QBER evaluation is critical for detecting eavesdroppers.
QPS/1.0 **MUST NOT** prescribe a single universal QBER threshold. Acceptable QBER bounds depend heavily on the physical implementation, the optical noise floor, and the privacy amplification scheme chosen.

Instead, the selected Key Establishment profile or deployment security policy MUST define acceptable thresholds. If the calculated QBER exceeds the configured threshold, the Server MUST abort the protocol and transition to the `FAILED` state.
