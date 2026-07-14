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
      return res.status(401).send({ error: 'Please authenticate.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id, active: true });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
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
