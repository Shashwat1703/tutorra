# Tutorra — M1 Wallet Auth (Backend)

Secure Solana wallet login (nonce → sign → verify → JWT → `/me`) using **Node.js + Express + Supabase**.  
This is the **backend-only MVP** for Stage-1.

## Stack
- Node.js, Express, CORS, dotenv  
- Supabase (Postgres) via `@supabase/supabase-js` (Service Role server-side)  
- Ed25519 signature verify via `tweetnacl` + `bs58`  
- JWT via `jsonwebtoken`

## Folder layout
apps/
api/
server.js
routes/
auth.js
lib/
supabase.js
nonceStore.js
middleware/
jwt.js
utils/
solana.js
scripts/
test-wallet.js