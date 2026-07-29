/**
 * @typedef {Object} QinertClientOptions
 * @property {string} baseURL - The base URL of the Qinert server (e.g. 'http://localhost:8000')
 * @property {number} [timeout] - Timeout in milliseconds for requests (default: 5000)
 * @property {Function} [fetch] - Custom fetch implementation (useful for Node.js)
 * @property {Object} [crypto] - Custom crypto implementation (useful for Node.js environments without global crypto)
 */

/**
 * @typedef {Object} HandshakeResult
 * @property {string} sessionId
 * @property {string} challengeNonce
 * @property {string} expiresAt
 */

/**
 * @typedef {Object} AuthenticationResult
 * @property {string} sessionId
 * @property {string} sessionToken
 * @property {string} expiresAt
 */

export {};
