# QPS Version Negotiation

## 1. Version Identifiers

QPS versions are identified using a `MAJOR.MINOR` format.

- The initial specification defined herein is **QPS/1.0**.

## 2. Version Declaration

Every QPS message MUST declare its version in the metadata envelope:

```json
{
  "version": "1.0"
}
```

## 3. Negotiation Protocol

1. The Client MUST declare its requested version in the `ProtocolInitiationRequest` (or `HandshakeRequest`).
2. The Server MUST evaluate the requested version.
3. If the Server supports the version, it responds using that version format.
4. If the Server does not support the version, it MUST respond with a `QPS-1001 UNSUPPORTED_VERSION` error and MAY provide a list of supported versions in the error metadata.

## 4. Future Compatibility

- **Minor Updates (e.g., QPS/1.1):** MUST be strictly backward compatible. They may introduce new optional fields or Key Establishment profiles, but MUST NOT alter the core State Machine or existing field structures.
- **Major Updates (e.g., QPS/2.0):** MAY introduce breaking changes to the State Machine, message canonicalization, or cryptographic requirements. Clients and Servers must explicitly negotiate QPS/2.0.
