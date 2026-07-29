import { jest } from '@jest/globals';
import { QinertClient } from '../src/client.js';
import { InvalidStateError, QberThresholdExceededError } from '../src/errors.js';
import crypto from 'crypto';

describe('QinertClient', () => {
  let mockFetch;
  let client;

  beforeEach(() => {
    mockFetch = jest.fn();
    client = new QinertClient({
      baseURL: 'http://test',
      fetch: mockFetch,
      crypto: crypto.webcrypto // Use Node's webcrypto for tests
    });
  });

  afterEach(() => {
    client.terminateSession();
  });

  it('enforces state machine constraints', async () => {
    // Cannot authenticate before handshake
    await expect(client.authenticate()).rejects.toThrow(InvalidStateError);
  });

  it('performs full successful handshake and authentication', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          payload: {
            session_id: 'sess-123',
            challenge_nonce: 'aabbccdd',
            expires_at: '2030-01-01',
            simulation_details: {
              final_hex_key: '0102030405060708090a0b0c0d0e0f10'
            }
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          payload: {
            session_id: 'sess-123',
            session_token: 'jwt.token.here',
            expires_at: '2030-01-01'
          }
        })
      });

    const hsResult = await client.handshake({ clientId: 'test' });
    expect(hsResult.sessionId).toBe('sess-123');
    expect(client._state).toBe('PROOF_PENDING');
    
    // Ensure the secret is loaded securely
    expect(client._sharedSecret).toBe('0102030405060708090a0b0c0d0e0f10');

    const authResult = await client.authenticate();
    expect(authResult.sessionToken).toBe('jwt.token.here');
    expect(client._state).toBe('SESSION_ACTIVE');

    // Ensure ZEROIZATION of shared secret occurred!
    expect(client._sharedSecret).toBeNull();
  });

  it('maps HTTP errors to specific QinertErrors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        status: 'error',
        payload: {
          error_code: 'QPS-2001',
          message: 'QBER Too High'
        }
      })
    });

    await expect(client.handshake({ clientId: 'test' })).rejects.toThrow(QberThresholdExceededError);
  });
});
