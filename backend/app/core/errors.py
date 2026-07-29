from enum import Enum

class ProtocolErrorCode(str, Enum):
    """
    Registry of all possible Qinert Protocol error codes.
    """
    INTERNAL_SERVER_ERROR = "QPS-5000"
    UNSUPPORTED_VERSION = "QPS-1001"
    INVALID_PROOF = "QPS-3000"
    SESSION_NOT_FOUND = "QPS-4001"
    SESSION_EXPIRED = "QPS-4000"
    ALGORITHM_NOT_SUPPORTED = "QPS-2000"
    QBER_TOO_HIGH = "QPS-2001"
    MALFORMED_REQUEST = "QPS-1000"
    UNAUTHORIZED = "QPS-4001"
