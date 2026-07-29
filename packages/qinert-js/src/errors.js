/**
 * QPS Error mappings.
 */

export class QinertError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'QinertError';
    this.code = code || 'QPS-UNKNOWN';
  }
}

export class InvalidRequestError extends QinertError {
  constructor(message = 'Invalid request payload') {
    super(message, 'QPS-1000');
    this.name = 'InvalidRequestError';
  }
}

export class UnsupportedVersionError extends QinertError {
  constructor(message = 'Unsupported QPS version') {
    super(message, 'QPS-1001');
    this.name = 'UnsupportedVersionError';
  }
}

export class InvalidStateError extends QinertError {
  constructor(message = 'Invalid protocol state transition') {
    super(message, 'QPS-1100');
    this.name = 'InvalidStateError';
  }
}

export class KeyEstablishmentError extends QinertError {
  constructor(message = 'Key establishment failed') {
    super(message, 'QPS-2000');
    this.name = 'KeyEstablishmentError';
  }
}

export class QberThresholdExceededError extends QinertError {
  constructor(message = 'QBER threshold exceeded. Potential eavesdropper detected.') {
    super(message, 'QPS-2001');
    this.name = 'QberThresholdExceededError';
  }
}

export class InvalidProofError extends QinertError {
  constructor(message = 'Invalid authentication proof') {
    super(message, 'QPS-3000');
    this.name = 'InvalidProofError';
  }
}

export class ChallengeExpiredError extends QinertError {
  constructor(message = 'Challenge has expired') {
    super(message, 'QPS-3001');
    this.name = 'ChallengeExpiredError';
  }
}

export class SessionExpiredError extends QinertError {
  constructor(message = 'Session has expired') {
    super(message, 'QPS-4000');
    this.name = 'SessionExpiredError';
  }
}

/**
 * Maps an HTTP response error payload to a specific QinertError.
 */
export function mapErrorResponse(data) {
  const code = data?.payload?.error_code || data?.detail || 'QPS-5000';
  const message = data?.payload?.message || data?.detail || 'Internal Error';

  switch (code) {
    case 'QPS-1000': return new InvalidRequestError(message);
    case 'QPS-1001': return new UnsupportedVersionError(message);
    case 'QPS-1100': return new InvalidStateError(message);
    case 'QPS-2000': return new KeyEstablishmentError(message);
    case 'QPS-2001': return new QberThresholdExceededError(message);
    case 'QPS-3000': return new InvalidProofError(message);
    case 'QPS-3001': return new ChallengeExpiredError(message);
    case 'QPS-4000': return new SessionExpiredError(message);
    default: return new QinertError(message, code);
  }
}
