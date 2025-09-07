const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  try {
    const header = req.headers['authorization'] || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'tutorra-api' });
    req.user = payload; // { sub: userId, wallet: walletAddress, iat, exp, iss }
    next();
  } catch (_e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authMiddleware };
