const AuditLog = require('../models/AuditLog');

const getModuleFromAction = (action) => {
  const act = action.toUpperCase();
  if (act.includes('LOGIN') || act.includes('LOGOUT') || act.startsWith('USER_')) return 'Auth';
  if (act.startsWith('CUSTOMER_')) return 'Customer';
  if (act.startsWith('VEHICLE_')) return 'Vehicle';
  if (act.startsWith('JOBCARD_')) return 'JobCard';
  if (act.startsWith('ESTIMATE_')) return 'Estimate';
  if (act.startsWith('INVOICE_')) return 'Invoice';
  if (act.startsWith('INVENTORY_')) return 'Inventory';
  if (act.startsWith('EMPLOYEE_')) return 'Employee';
  if (act.startsWith('CLAIM_')) return 'Claim';
  if (act.startsWith('REPORT_')) return 'Report';
  if (act.startsWith('GATEPASS_')) return 'GatePass';
  return 'System';
};

const logAction = async (user, action, details, req = null) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') : '';
    const resolvedModule = getModuleFromAction(action);
    const uRole = user?.role || 'Guest';

    await AuditLog.create({
      userId: user?._id || null,
      userName: user?.name || 'Guest/System',
      role: uRole,
      userRole: uRole,
      module: resolvedModule,
      action,
      details,
      ipAddress,
      timestamp: new Date(),
      createdAt: new Date()
    });
  } catch (err) {
    console.error('AuditLog logging failed:', err);
  }
};

module.exports = { logAction };
