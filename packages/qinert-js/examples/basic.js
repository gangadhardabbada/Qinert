import { QinertClient } from '../src/index.js';

// Setup specifically for NodeJS
// In a browser environment, these are globally available and don't need to be imported
import crypto from 'crypto';

async function main() {
  const qinert = new QinertClient({
    baseURL: 'http://localhost:8000',
    crypto: crypto.webcrypto // Needed in Node.js, ignored in browsers
  });

  try {
    console.log("1. Initiating Handshake...");
    const hs = await qinert.handshake({ clientId: 'demo_user' });
    console.log(`✅ Handshake complete. Challenge received: ${hs.challengeNonce}`);

    console.log("\n2. Authenticating via HMAC Proof...");
    const auth = await qinert.authenticate();
    console.log(`✅ Authentication successful. JWT: ${auth.sessionToken}`);

    // Terminate session to securely zeroize RAM
    qinert.terminateSession();
  } catch (error) {
    console.error(`❌ Authentication failed: ${error.message} (${error.code})`);
  }
}

main();
