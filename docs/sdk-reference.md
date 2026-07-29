# SDK Reference

Qinert provides official SDKs to facilitate easy integration with the QPS/1.0 protocol without developers needing to manually implement quantum circuits or HMAC verification.

## Qinert JavaScript SDK (`qinert-js`)
Located in `packages/qinert-js/`, this SDK is heavily used by the React frontend.

### Installation
(Local package link currently, intended for npm registry in production)
```bash
npm install qinert-js
```

### Core Classes
#### `QinertClient`
The primary interface for authentication.
```javascript
import { QinertClient } from 'qinert-js';

const client = new QinertClient({
  baseUrl: 'http://localhost:8000',
  clientId: 'app-client-123'
});

// Authenticate using Qiskit Aer
const session = await client.authenticate('qiskit_aer');
```

#### `BB84Simulator`
A local JavaScript implementation of the BB84 protocol for purely client-side simulation and demonstration purposes, avoiding constant network round trips during workbench tutorials.

## Qinert Python SDK (`qinert-python`)
Located in `packages/qinert-python/`, intended for server-to-server communication or CLI tools.
Features synchronous and asynchronous `QinertClient` implementations using `httpx`.
