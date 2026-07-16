const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'autoworkshop_secret_key_123';

const auth = async (req, res, next) => {
  try {
    console.log('[Auth Middleware] Headers Authorization:', req.header('Authorization'));
    console.log('[Auth Middleware] Query Token:', req.query.token);

    let token = req.query.token;

    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
      }
    }

    if (!token) {
      try {
        const AuditLog = require('../models/AuditLog');
        await AuditLog.create({
          userName: 'Guest/AuthFailed',
          role: 'Guest',
          userRole: 'Guest',
          module: 'Auth',
          action: 'AUTH_FAILED',
          details: `Auth failure: Missing token. URL=${req.originalUrl}, HeadersAuth=${req.header('Authorization') ? 'present' : 'none'}`,
          ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
          timestamp: new Date(),
          createdAt: new Date()
        });
      } catch (logErr) {}

      return res.status(401).send({ error: 'Please authenticate.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id, active: true });

    if (!user) {
      throw new Error('User not found or inactive');
    }

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    console.error('[Auth Middleware] Error verifying token:', e);

    try {
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        userName: 'Guest/AuthFailed',
        role: 'Guest',
        userRole: 'Guest',
        module: 'Auth',
        action: 'AUTH_FAILED',
        details: `Auth failure: URL=${req.originalUrl}, QueryToken=${req.query.token ? req.query.token.substring(0, 10) + '...' : 'none'}, Error=${e.message || e.toString()}`,
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
        timestamp: new Date(),
        createdAt: new Date()
      });
    } catch (logErr) {
      console.error('[Auth Middleware] Failed to log failure to AuditLog:', logErr);
    }

    res.status(401).send({ error: 'Please authenticate.' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).send({ error: 'Access denied: Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { auth, restrictTo, JWT_SECRET };
