require('dotenv').config();
const nacl = require('tweetnacl');
const bs58 = require('bs58');

const API = process.env.API_URL || 'http://localhost:4000';

async function main() {
  const kp = nacl.sign.keyPair(); // ephemeral test wallet
  const pub58 = bs58.encode(kp.publicKey);
  console.log('Test wallet (publicKey base58):', pub58);

  // 1) Get nonce
  let resp = await fetch(`${API}/auth/nonce`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress: pub58 })
  });
  const noncePayload = await resp.json();
  if (!resp.ok) throw new Error('Nonce failed: ' + JSON.stringify(noncePayload));
  const { message } = noncePayload;
  console.log('\nMessage to sign:\n' + message + '\n');

  // 2) Sign the message
  const messageBytes = new TextEncoder().encode(message);
  const sigBytes = nacl.sign.detached(messageBytes, kp.secretKey);
  const sig58 = bs58.encode(sigBytes);
  console.log('Signature (base58):', sig58, '\n');

  // 3) Verify/login
  resp = await fetch(`${API}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress: pub58, signature: sig58 })
  });
  const loginPayload = await resp.json();
  if (!resp.ok) throw new Error('Verify failed: ' + JSON.stringify(loginPayload));

  console.log('JWT:', loginPayload.token, '\n');

  // 4) /me
  resp = await fetch(`${API}/me`, {
    headers: { 'Authorization': `Bearer ${loginPayload.token}` }
  });
  const me = await resp.json();
  console.log('/me =>', me);

  console.log(`\nReady-to-run curl.exe commands:
curl.exe -X POST ${API}/auth/nonce -H "Content-Type: application/json" -d "{\\"walletAddress\\":\\"${pub58}\\"}"
curl.exe -X POST ${API}/auth/verify -H "Content-Type: application/json" -d "{\\"walletAddress\\":\\"${pub58}\\",\\"signature\\":\\"${sig58}\\"}"
curl.exe ${API}/me -H "Authorization: Bearer ${loginPayload.token}"
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
