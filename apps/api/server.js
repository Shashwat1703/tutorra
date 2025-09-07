require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const { authMiddleware } = require('./middleware/jwt');
const { supabase } = require('./lib/supabase');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

// Auth routes
app.use('/auth', authRoutes);

// Protected: current user
app.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { data, error } = await supabase
      .from('users')
      .select('id,wallet_address,display_name,created_at,last_login')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'User not found' });
    res.json({ user: data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Tutorra API listening on http://localhost:${port}`);
});
