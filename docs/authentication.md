# Authentication Flow

Qinert utilizes a quantum-secured Proof-of-Possession (PoP) authentication flow, rather than transmitting a password or shared secret across the network.

## The Challenge-Response Mechanism

1. **Key Establishment**: 
   - Alice (Client) and Bob (Server) execute BB84.
   - They compare bases and sift their bits to form a raw shared secret.
   - They calculate QBER. If safe, they proceed.

2. **The Challenge**:
   - The server generates a cryptographically secure, random 32-byte `challenge` nonce.
   - The server temporarily caches this challenge against the `client_id` (valid for 60 seconds).
   - The server sends the `challenge` to the client.

3. **The Proof**:
   - The client uses its local copy of the sifted key.
   - The client computes: `proof = HMAC-SHA-256(key=shared_key, msg=challenge)`.
   - The client sends the `proof` to the server.

4. **Verification**:
   - The server computes the expected proof using its own local copy of the sifted key and the cached challenge.
   - The server uses a constant-time comparison (`secrets.compare_digest`) to verify the client's proof against the expected proof.
   - If they match, the server generates a Session Token and authenticates the user.

## Session Lifecycle
- **Creation**: Upon successful verification, a JWT-like secure token is generated and persisted in the `sessions` table.
- **Usage**: Clients send this token in the `Authorization: Bearer <token>` header.
- **Expiration**: Sessions have a hard expiry (e.g., 24 hours).
- **Invalidation**: Users can explicitly logout, setting `is_active = False` in the database.
