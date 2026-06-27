const AuditLog = require('../models/AuditLog');

const logAction = async (user, action, details, req = null) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') : '';
    await AuditLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action,
      details,
      ipAddress
    });
  } catch (err) {
    console.error('AuditLog logging failed:', err);
  }
};

module.exports = { logAction };
