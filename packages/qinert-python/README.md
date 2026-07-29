# Qinert Python SDK

The official Python client SDK for QPS/1.0 (Qinert Protocol Specification).

## Installation

```bash
pip install .
```

## Features
- **Sync & Async**: Provides both `QinertClient` and `AsyncQinertClient` natively using `httpx`.
- **Pydantic Models**: Requests and responses are strongly typed and validated using Pydantic.
- **Secure**: Strictly adheres to the QPS/1.0 zeroization policy, securely generating HMAC proofs in memory and immediately destroying symmetric quantum-derived keys.
- **Context Managers**: Cleanly manage connection pools and automatic session tear-downs.

## Basic Usage

```python
from qinert import QinertClient, QinertError

try:
    with QinertClient(base_url="http://localhost:8000") as qinert:
        
        # 1. Establish the quantum key via BB84
        qinert.handshake(client_id="alice")

        # 2. Perform the HMAC-SHA-256 challenge
        session = qinert.authenticate()

        print("Success! Token:", session.payload.session_token)

except QinertError as e:
    print(f"Protocol Error: {e.code} - {e.message}")
```

## Async Usage

```python
import asyncio
from qinert import AsyncQinertClient

async def main():
    async with AsyncQinertClient(base_url="http://localhost:8000") as qinert:
        await qinert.handshake(client_id="alice")
        session = await qinert.authenticate()
        print(session.payload.session_token)

asyncio.run(main())
```
