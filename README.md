Tutorra — M1 Wallet Auth (Backend)

Secure Solana wallet login (nonce → sign → verify → JWT → /me) using Node.js + Express + Supabase.
This is the backend-only MVP for Stage-1.

Stack

Node.js, Express, CORS, dotenv

Supabase (Postgres) via @supabase/supabase-js (Service Role server-side)

Ed25519 signature verify via tweetnacl + bs58

JWT via jsonwebtoken

Folder layout

apps/
└─ api/
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

Environment (.env in apps/api)

SUPABASE_URL=<your-supabase-project-url>
SUPABASE_SERVICE_ROLE=<your-service-role-key> (server-only)
JWT_SECRET=<strong-random-secret>
PORT=4000
API_URL=http://localhost:4000

Supabase schema (run in Supabase SQL Editor)

Ensure uuid generator exists:
create extension if not exists "pgcrypto";

Create users table:
create table if not exists public.users (
 id uuid primary key default gen_random_uuid(),
 wallet_address text not null unique,
 display_name text,
 created_at timestamptz not null default now(),
 last_login timestamptz
);

Helpful index:
create index if not exists idx_users_wallet on public.users (wallet_address);

Run (dev)

cd apps/api

npm run dev

Health check in browser: http://localhost:4000/healthz

Endpoints

GET /healthz
• Returns: { ok: true, uptime }

POST /auth/nonce
• Request JSON: { "walletAddress": "<base58 public key>" }
• Response JSON: { nonce, message, expiresAt }
• The wallet must sign the exact message (UTF-8) returned here.

POST /auth/verify
• Request JSON: { "walletAddress": "<base58 public key>", "signature": "<base58 signature>" }
• Verifies Ed25519 signature over the exact message from /auth/nonce
• Upserts user into Supabase by wallet_address
• Response JSON: { token, user } (token is a JWT, 7 days)

GET /me (JWT required)
• Header: Authorization: Bearer <token>
• Response JSON: { user }

Local E2E test (no Phantom needed)

From apps/api:
npm run test:m1
This script:
• Generates an ephemeral wallet
• Calls /auth/nonce and signs the message
• Calls /auth/verify, prints the JWT
• Calls /me and prints your user row
• Prints ready-to-run curl.exe commands for manual testing

Manual curl (example)

Get nonce:
curl.exe -X POST http://localhost:4000/auth/nonce
 -H "Content-Type: application/json" -d "{"walletAddress":"<PUBKEY>"}"

Sign the exact “message” string from step 1 (use your wallet or the helper script below).

Verify to get JWT:
curl.exe -X POST http://localhost:4000/auth/verify
 -H "Content-Type: application/json" -d "{"walletAddress":"<PUBKEY>","signature":"<SIG>"}"

Call /me:
curl.exe http://localhost:4000/me
 -H "Authorization: Bearer <JWT>"

Optional helper to get a signature locally (apps/api):
npm run test:sign
This prints walletAddress, message, and signature for your manual /auth/verify call.

Security (M1)

Ed25519 verification over time-bound nonce (TTL 5 minutes, stored in-memory for MVP)

JWT with issuer (tutorra-api) and 7-day expiry

Supabase Service Role key is used only on the server; never exposed to the frontend

Planned hardening (M2)

Add express-rate-limit on /auth/*

Add Zod request schemas for clean validation errors

Persist nonces (Redis or Supabase) + basic audit logs

(Optional later) Enable RLS when introducing anon client access

Git hygiene

.gitignore should exclude: node_modules/, apps/api/node_modules/, apps/api/.env, .DS_Store

Status

Module 1 (backend wallet auth) is complete and testable end-to-end.
Next up (Module 2): minimal React/Vite frontend to connect Phantom, sign message, hit /auth/verify, store JWT, and call /me.