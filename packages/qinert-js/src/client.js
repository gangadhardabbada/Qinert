import { mapErrorResponse, QinertError, InvalidStateError } from './errors.js';

export class QinertClient {
  /**
   * @param {import('./types.js').QinertClientOptions} options
   */
  constructor(options) {
    if (!options || !options.baseURL) {
      throw new Error("baseURL is required");
    }
    
    this.baseURL = options.baseURL.replace(/\/$/, '');
    this.timeout = options.timeout || 5000;
    
    // Inject fetch and crypto (WebCrypto API) for cross-platform compatibility
    this._fetch = options.fetch || (typeof globalThis !== 'undefined' ? globalThis.fetch.bind(globalThis) : null);
    this._crypto = options.crypto || (typeof globalThis !== 'undefined' ? globalThis.crypto : null);

    if (!this._fetch) throw new Error("A fetch implementation is required.");
    if (!this._crypto || !this._crypto.subtle) throw new Error("WebCrypto API is required.");

    this._state = 'INITIAL';
    this._sessionId = null;
    this._sharedSecret = null; // Ephemeral RAM-only
    this._sessionToken = null;
    this._challengeNonce = null;
  }

  /**
   * Internal wrapper for making fetch requests with timeouts and error handling
   */
  async _request(method, endpoint, payload, customHeaders = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const headers = { 
        'Content-Type': 'application/json',
        'X-Qinert-Simulate': 'true',
        ...customHeaders
      };
      if (this._sessionToken) {
        headers['Authorization'] = `Bearer ${this._sessionToken}`;
      }

      const response = await this._fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers,
        body: payload ? JSON.stringify(payload) : undefined,
        signal: controller.signal
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        throw mapErrorResponse(data);
      }

      return data;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new QinertError('Request timed out', 'QPS-5004');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Translates hex string to ArrayBuffer for WebCrypto
   */
  _hexToArrayBuffer(hexString) {
    const matches = hexString.match(/.{1,2}/g);
    if (!matches) return new Uint8Array();
    return new Uint8Array(matches.map(byte => parseInt(byte, 16))).buffer;
  }

  /**
   * Translates ArrayBuffer to hex string
   */
  _arrayBufferToHex(buffer) {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Optional conceptual step defined in QPS/1.0. 
   * In the reference backend, this is handled within handshake.
   */
  async initiate(supportedAlgorithms = ['bb84']) {
    if (this._state !== 'INITIAL') {
      throw new InvalidStateError();
    }
    this._state = 'IDENTIFIED';
    return { status: 'identified', supportedAlgorithms };
  }

  /**
   * Executes the Handshake & Key Establishment phase.
   * @param {Object} params
   * @param {string} params.clientId
   * @param {string} [params.requestedVersion='1.0.0']
   * @returns {Promise<import('./types.js').HandshakeResult>}
   */
  async handshake({ clientId, requestedVersion = '1.0.0', demoAction = null }) {
    if (this._state !== 'INITIAL' && this._state !== 'IDENTIFIED') {
      throw new InvalidStateError();
    }

    this._state = 'KEY_ESTABLISHING';
    
    const headers = {};
    if (demoAction) {
      headers['X-Qinert-Demo-Action'] = demoAction;
    }

    // In our reference implementation, /handshake encapsulates initiation + key establishment
    const data = await this._request('POST', '/api/v1/protocol/handshake', {
      client_id: clientId,
      requested_version: requestedVersion,
      supported_algorithms: ['bb84']
    }, headers);

    const payload = data.payload;
    
    this._sessionId = payload.session_id;
    this._challengeNonce = payload.challenge_nonce;
    
    // Storing shared secret completely ephemerally in RAM
    // The reference backend returns final_hex_key inside simulation_details
    this._sharedSecret = payload.simulation_details?.final_hex_key;
    
    this._state = 'PROOF_PENDING';

    const { final_hex_key, ...safeSimulationDetails } = payload.simulation_details || {};

    return {
      sessionId: this._sessionId,
      challengeNonce: this._challengeNonce,
      expiresAt: payload.expires_at,
      simulationDetails: safeSimulationDetails,
      selectedAlgorithm: payload.selected_algorithm,
      acceptedVersion: payload.accepted_version
    };
  }

  /**
   * Generates the HMAC-SHA-256 proof and submits it to the server.
   * Zeroizes the shared secret immediately after computation.
   * @returns {Promise<import('./types.js').AuthenticationResult>}
   */
  async authenticate(options = {}) {
    const { invalidProof = false } = options;

    if (this._state !== 'PROOF_PENDING') {
      throw new InvalidStateError();
    }
    if (!this._sharedSecret || !this._challengeNonce) {
      throw new QinertError("Missing secret or challenge nonce", "QPS-INTERNAL");
    }

    try {
      // 1. Import Key using WebCrypto
      const keyBuffer = this._hexToArrayBuffer(this._sharedSecret);
      const cryptoKey = await this._crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      // 2. Compute HMAC
      const challengeBuffer = new TextEncoder().encode(this._challengeNonce);
      const signatureBuffer = await this._crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        challengeBuffer
      );

      let proofHex = this._arrayBufferToHex(signatureBuffer);
      if (invalidProof) {
        proofHex = "deadbeef" + proofHex.slice(8);
      }

      // 3. Submit proof
      const data = await this._request('POST', '/api/v1/protocol/authenticate', {
        session_id: this._sessionId,
        proof: proofHex
      });

      const payload = data.payload;
      
      this._sessionToken = payload.session_token;
      this._state = 'SESSION_ACTIVE';

      return {
        sessionId: payload.session_id,
        sessionToken: this._sessionToken,
        expiresAt: payload.expires_at
      };

    } finally {
      // SECURITY: Zeroize the shared secret immediately after use.
      // In JS we just lose the reference so GC cleans it.
      this._sharedSecret = null;
      this._challengeNonce = null;
    }
  }

  /**
   * Retrieves the current session token if active.
   */
  getSession() {
    return this._sessionToken;
  }

  /**
   * Terminates the session securely.
   */
  terminateSession() {
    this._sessionToken = null;
    this._sessionId = null;
    this._sharedSecret = null;
    this._state = 'TERMINATED';
  }

  /**
   * Retrieves information about the currently active Quantum Engine (Reference Implementation only).
   */
  async getEngineInfo() {
    return this._request('GET', '/api/v1/quantum/info');
  }

  /**
   * Updates the active Quantum Engine (Reference Implementation only).
   * @param {string} engineName - 'classical', 'qiskit', or 'ibm_quantum'
   */
  async changeEngine(engineName) {
    return this._request('POST', '/api/v1/quantum/engine', { engine: engineName });
  }

  /**
   * Retrieves operational IBM Quantum backends.
   */
  async getIBMBackends() {
    return this._request('GET', '/api/v1/quantum/backends');
  }

  /**
   * Retrieves status of an IBM Quantum job.
   * @param {string} jobId 
   */
  async getIBMJob(jobId) {
    return this._request('GET', `/api/v1/quantum/jobs/${jobId}`);
  }

  /**
   * Run a BB84 experiment across multiple engines.
   * @param {object} params
   */
  async runExperiment(params) {
    return this._request('POST', '/api/v1/experiments/bb84', params);
  }

  /**
   * Retrieves an experiment's status.
   * @param {string} experimentId
   */
  async getExperiment(experimentId) {
    return this._request('GET', `/api/v1/experiments/${experimentId}`);
  }

  /**
   * Retrieves an experiment's comparison data.
   * @param {string} experimentId
   */
  async getExperimentComparison(experimentId) {
    return this._request('GET', `/api/v1/experiments/${experimentId}/comparison`);
  }
}

