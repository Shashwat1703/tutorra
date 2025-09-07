const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const { supabase } = require('../lib/supabase');
const { createNonce, getNonceRecord, consumeNonce } = require('../lib/nonceStore');
const { verifySignature } = require('../utils/solana');

// POST /auth/nonce  -> returns { nonce, message, expiresAt }
router.post('/nonce', async (req, res) => {
  try {
    const { walletAddress } = req.body || {};
    if (!walletAddress || typeof walletAddress !== 'string') {
      return res.status(400).json({ error: 'walletAddress is required' });
    }
    const { nonce, message, expiresAt } = createNonce(walletAddress);
    res.json({ nonce, message, expiresAt });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /auth/verify  -> verifies signature, upserts user, returns JWT + user
router.post('/verify', async (req, res) => {
  try {
    const { walletAddress, signature } = req.body || {};
    if (!walletAddress || !signature) {
      return res.status(400).json({ error: 'walletAddress and signature are required' });
    }

    const rec = getNonceRecord(walletAddress);
    if (!rec) {
      return res.status(400).json({ error: 'No valid nonce. Request a new one.' });
    }

    // Verify ed25519 signature over the exact message string (UTF-8)
    const ok = verifySignature(rec.message, signature, walletAddress);
    if (!ok) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    // Consume nonce to prevent replay
    consumeNonce(walletAddress);

    // Upsert user by wallet
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('users')
      .upsert(
        { wallet_address: walletAddress, last_login: nowIso },
        { onConflict: 'wallet_address' }
      )
      .select('id,wallet_address,display_name,created_at,last_login')
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'DB upsert failed' });
    }

    // Issue JWT
    const token = jwt.sign(
      { sub: data.id, wallet: data.wallet_address },
      process.env.JWT_SECRET,
      { expiresIn: '7d', issuer: 'tutorra-api' }
    );

    res.json({ token, user: data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
