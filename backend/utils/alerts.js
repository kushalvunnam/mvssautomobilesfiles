const Inventory = require('../models/Inventory');
const Notification = require('../models/Notification');

const checkLowStockAlerts = async () => {
  try {
    const allInventory = await Inventory.find({});
    
    for (const item of allInventory) {
      const curStock = item.currentStock !== undefined ? item.currentStock : item.stockQuantity;
      const minStock = item.minimumStock !== undefined ? item.minimumStock : item.lowStockThreshold;

      if (curStock <= minStock) {
        const isOut = curStock === 0;
        const severity = isOut ? 'CRITICAL' : 'WARNING';
        const title = isOut ? 'OUT OF STOCK ALERT' : 'LOW STOCK ALERT';
        const alertMessage = `${item.partName} (${item.partNumber})\nCurrent Stock: ${curStock}\nMinimum Stock: ${minStock}\nSeverity Level: ${severity}`;

        // Check if an unread notification for this part exists
        const existing = await Notification.findOne({
          type: 'low_stock',
          title: title,
          customerName: item.partName,
          status: 'unread'
        });

        if (!existing) {
          const notif = new Notification({
            type: 'low_stock',
            title: title,
            message: alertMessage,
            serviceType: severity, // Severity level
            vehicleNumber: item.partNumber, // Part Number
            customerName: item.partName, // Part Name
            status: 'unread'
          });
          await notif.save();
        }
      }
    }
  } catch (error) {
    console.error('Failed to process low stock alerts:', error);
  }
};

module.exports = { checkLowStockAlerts };
