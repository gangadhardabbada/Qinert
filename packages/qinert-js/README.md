# @qinert/client

The official JavaScript SDK for QPS/1.0 (Qinert Protocol Specification).

## Installation

```bash
npm install @qinert/client
```

## Features

- **Zero Dependencies**: Relies entirely on native `fetch` and `WebCrypto`.
- **Framework Independent**: Works in React, Vue, Svelte, or plain Node.js.
- **Secure**: Implements the QPS/1.0 zeroization protocols, securely generating HMAC-SHA-256 proofs natively and discarding the symmetric quantum-derived keys instantly.

## Basic Usage

```javascript
import { QinertClient } from "@qinert/client";

// In the browser, the client automatically uses the global `fetch` and `crypto` objects
const qinert = new QinertClient({
  baseURL: "http://localhost:8000"
});

async function login() {
  try {
    // 1. Establish the quantum key via BB84
    await qinert.handshake({ clientId: "alice" });

    // 2. Perform the HMAC-SHA-256 challenge
    const session = await qinert.authenticate();

    console.log("Success! Token:", session.sessionToken);
  } catch (error) {
    console.error(`Protocol Error: ${error.code} - ${error.message}`);
  } finally {
    // Zeroizes any remaining key material from RAM
    qinert.terminateSession(); 
  }
}
```

## Node.js Usage

When running in Node.js, you must inject the native `crypto.webcrypto`.

```javascript
import crypto from "crypto";
import { QinertClient } from "@qinert/client";

const qinert = new QinertClient({
  baseURL: "http://localhost:8000",
  crypto: crypto.webcrypto
});
```
