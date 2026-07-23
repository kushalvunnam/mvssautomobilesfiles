const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

// Get all messages (Authenticated)
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(50);
    res.json(messages);
  } catch (err) {
    console.error('Failed to fetch messages:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new message (Public)
router.post('/', async (req, res) => {
  try {
    const { senderName, email, phone, subject, body, type } = req.body;
    if (!senderName || !subject || !body) {
      return res.status(400).json({ error: 'Sender name, subject, and body are required' });
    }

    const message = new Message({
      senderName,
      email,
      phone,
      subject,
      body,
      type: type || 'inquiry'
    });
    await message.save();

    res.status(201).json({ message: 'Message sent successfully', message });
  } catch (err) {
    console.error('Failed to save message:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark single message as read (Authenticated)
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status: 'read' },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message);
  } catch (err) {
    console.error('Failed to mark message as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all messages as read (Authenticated)
router.put('/read-all', auth, async (req, res) => {
  try {
    await Message.updateMany({ status: 'unread' }, { status: 'read' });
    res.json({ message: 'All messages marked as read' });
  } catch (err) {
    console.error('Failed to mark all messages as read:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
