class QinertError(Exception):
    def __init__(self, message: str, code: str = "QPS-UNKNOWN"):
        super().__init__(message)
        self.code = code
        self.message = message

    def __str__(self):
        return f"[{self.code}] {self.message}"

class InvalidRequestError(QinertError):
    def __init__(self, message: str = "Invalid request payload"):
        super().__init__(message, "QPS-1000")

class UnsupportedVersionError(QinertError):
    def __init__(self, message: str = "Unsupported QPS version"):
        super().__init__(message, "QPS-1001")

class InvalidStateError(QinertError):
    def __init__(self, message: str = "Invalid protocol state transition"):
        super().__init__(message, "QPS-1100")

class KeyEstablishmentError(QinertError):
    def __init__(self, message: str = "Key establishment failed"):
        super().__init__(message, "QPS-2000")

class QberThresholdExceededError(QinertError):
    def __init__(self, message: str = "QBER threshold exceeded. Potential eavesdropper detected."):
        super().__init__(message, "QPS-2001")

class InvalidProofError(QinertError):
    def __init__(self, message: str = "Invalid authentication proof"):
        super().__init__(message, "QPS-3000")

class ChallengeExpiredError(QinertError):
    def __init__(self, message: str = "Challenge has expired"):
        super().__init__(message, "QPS-3001")

class SessionExpiredError(QinertError):
    def __init__(self, message: str = "Session has expired"):
        super().__init__(message, "QPS-4000")

def map_error_response(data: dict) -> QinertError:
    payload = data.get("payload", {})
    code = payload.get("error_code") or data.get("detail") or "QPS-5000"
    message = payload.get("message") or data.get("detail") or "Internal Error"

    mapping = {
        "QPS-1000": InvalidRequestError,
        "QPS-1001": UnsupportedVersionError,
        "QPS-1100": InvalidStateError,
        "QPS-2000": KeyEstablishmentError,
        "QPS-2001": QberThresholdExceededError,
        "QPS-3000": InvalidProofError,
        "QPS-3001": ChallengeExpiredError,
        "QPS-4000": SessionExpiredError,
    }
    
    exc_class = mapping.get(code, QinertError)
    if exc_class is QinertError:
        return exc_class(message, code)
    return exc_class(message)
