require('dotenv').config();
const nacl = require('tweetnacl');
const bs58 = require('bs58');

const API = process.env.API_URL || 'http://localhost:4000';

async function main() {
  const kp = nacl.sign.keyPair();
  const pub58 = bs58.encode(kp.publicKey);
  console.log('Wallet (base58):', pub58);

  // 1) Get nonce + message
  let resp = await fetch(`${API}/auth/nonce`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress: pub58 })
  });
  const { message } = await resp.json();
  if (!resp.ok) throw new Error('Nonce failed');

  console.log('\nMessage to sign (exactly this):\n' + message + '\n');

  // 2) Sign (locally)
  const sigBytes = nacl.sign.detached(new TextEncoder().encode(message), kp.secretKey);
  const sig58 = bs58.encode(sigBytes);

  console.log('Signature (base58):', sig58, '\n');

  console.log('Next step: use curl/Postman to call /auth/verify with:');
  console.log(`walletAddress = ${pub58}`);
  console.log(`signature     = ${sig58}\n`);

  console.log(`curl.exe -X POST ${API}/auth/verify -H "Content-Type: application/json" -d "{\\"walletAddress\\":\\"${pub58}\\",\\"signature\\":\\"${sig58}\\"}"`);
  console.log('\nThen copy the "token" from the response and call:');
  console.log(`curl.exe ${API}/me -H "Authorization: Bearer <PASTE_TOKEN_HERE>"`);
}
main().catch(e => { console.error(e); process.exit(1); });
