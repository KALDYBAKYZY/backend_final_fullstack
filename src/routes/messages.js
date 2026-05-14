const express = require('express');
const Message = require('../models/Message');
const Room = require('../models/Room');
const { protect } = require('../middleware/auth');
const router = express.Router();

// GET /api/messages/:roomId  — paginated history
router.get('/:roomId', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const isMember = room.members.some((m) => m.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Not a member of this room' });

    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const messages = await Message.find({ room: req.params.roomId })
      .populate('sender', 'username avatar')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages/:roomId
router.post('/:roomId', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const isMember = room.members.some((m) => m.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Not a member' });

    const message = await Message.create({
      content: req.body.content,
      type: req.body.type || 'text',
      sender: req.user._id,
      room: req.params.roomId,
      fileAttachment: req.body.fileAttachment || null,
    });

    const populated = await message.populate('sender', 'username avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/messages/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.sender.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Cannot delete others messages' });
    await message.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;