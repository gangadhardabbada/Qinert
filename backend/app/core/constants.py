"""
Qinert Protocol Constants
"""

PROTOCOL_IDENTIFIER = "QINERT"
PROTOCOL_VERSION = "1.0.0"

SUPPORTED_ALGORITHMS = ["bb84"]
DEFAULT_ALGORITHM = "bb84"

SUPPORTED_PROOFS = ["hmac-sha256"]
DEFAULT_PROOF = "hmac-sha256"

# Header for returning request ID if needed
HEADER_REQUEST_ID = "x-qinert-request-id"
