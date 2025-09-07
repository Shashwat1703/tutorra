const crypto = require('crypto');

const store = new Map(); // walletAddress -> { nonce, message, expiresAt }
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

function buildLoginMessage(walletAddress, nonce) {
  const issuedAt = new Date().toISOString();
  return [
    'Tutorra wants you to sign in with your Solana wallet.',
    '',
    `Wallet: ${walletAddress}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
    'Domain: tutorra.local',
    '',
    'By signing, you agree to the Terms.'
  ].join('\n');
}

function createNonce(walletAddress, ttlMs = DEFAULT_TTL_MS) {
  const nonce = crypto.randomBytes(16).toString('hex');
  const message = buildLoginMessage(walletAddress, nonce);
  const expiresAt = Date.now() + ttlMs;
  store.set(walletAddress, { nonce, message, expiresAt });
  return { nonce, message, expiresAt };
}

function getNonceRecord(walletAddress) {
  const rec = store.get(walletAddress);
  if (!rec) return null;
  if (Date.now() > rec.expiresAt) {
    store.delete(walletAddress);
    return null;
  }
  return rec;
}

function consumeNonce(walletAddress) {
  store.delete(walletAddress);
}

// Cleanup expired nonces every minute (won't keep the process alive)
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of store) if (now > v.expiresAt) store.delete(k);
}, 60 * 1000).unref();

module.exports = { createNonce, getNonceRecord, consumeNonce };
