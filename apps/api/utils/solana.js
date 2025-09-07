const nacl = require('tweetnacl');
const bs58 = require('bs58');

/**
 * Verify an ed25519 signature (Solana wallet style).
 * @param {string} message - The exact message string that was signed (UTF-8).
 * @param {string} signatureBase58 - Base58-encoded signature bytes.
 * @param {string} walletBase58 - Base58-encoded public key (wallet address).
 * @returns {boolean}
 */
function verifySignature(message, signatureBase58, walletBase58) {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const sigBytes = bs58.decode(signatureBase58);
    const pubKeyBytes = bs58.decode(walletBase58);
    return nacl.sign.detached.verify(messageBytes, sigBytes, pubKeyBytes);
  } catch (_e) {
    return false; // if inputs are malformed
  }
}

module.exports = { verifySignature };
