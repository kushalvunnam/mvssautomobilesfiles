const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// Get all notifications (Authenticated)
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ type: { $ne: 'tracking' } }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    console.error('Failed to fetch notifications:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark single notification as read (Authenticated)
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { status: 'read' },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
  } catch (err) {
    console.error('Failed to mark notification as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all notifications as read (Authenticated)
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ status: 'unread' }, { status: 'read' });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Failed to mark all as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
