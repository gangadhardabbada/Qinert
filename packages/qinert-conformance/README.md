# QPS/1.0 Conformance Suite

An implementation-independent test suite to determine if a server strictly adheres to the Qinert Protocol Specification (QPS/1.0).

## Usage

```bash
pip install -e .
python conformance.py http://127.0.0.1:8000
```

## How It Works
Unlike the `qinert-python` SDK (which actively prevents you from sending invalid state transitions), this conformance suite uses raw HTTP via `httpx` to intentionally probe the server with:
- Invalid protocol states
- Malformed payloads
- Replayed signatures
- Out-of-bounds versions

It verifies 20 distinct categories required by QPS/1.0 and generates a detailed `conformance_report.json`.
