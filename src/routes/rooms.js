const express = require('express');
const Room = require('../models/Room');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { escapeRegex } = require('../utils/helpers');
const router = express.Router();

// GET /api/rooms  (search + filter)
router.get('/', protect, async (req, res) => {
  try {
    const { search, subject } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: escapeRegex(search), $options: 'i' };
    if (subject) filter.subject = subject;

    const rooms = await Room.find(filter)
      .populate('owner', 'username avatar')
      .populate('members', 'username avatar')
      .sort('-createdAt');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/rooms/my  — rooms the current user is a member of
router.get('/my', protect, async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id })
      .populate('owner', 'username avatar')
      .sort('-updatedAt');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/rooms/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('owner', 'username avatar bio')
      .populate('members', 'username avatar');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/rooms
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, subject, isPrivate, tags } = req.body;
    const room = await Room.create({
      name, description, subject, isPrivate, tags,
      owner: req.user._id,
      members: [req.user._id],   // owner is automatically a member
    });
    // Add room to user's rooms array (many-to-many sync)
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { rooms: room._id } });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/rooms/:id
router.patch('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only owner can edit the room' });

    const { name, description, subject, isPrivate, tags, coverImage } = req.body;
    Object.assign(room, { name, description, subject, isPrivate, tags, coverImage });
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/rooms/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only owner can delete the room' });

    await room.deleteOne();
    // Remove room from all members
    await User.updateMany({ rooms: room._id }, { $pull: { rooms: room._id } });
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/rooms/:id/join   (many-to-many)
router.post('/:id/join', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    await Room.findByIdAndUpdate(room._id, { $addToSet: { members: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { rooms: room._id } });
    res.json({ message: 'Joined room' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/rooms/:id/leave  (many-to-many)
router.post('/:id/leave', protect, async (req, res) => {
  try {
    await Room.findByIdAndUpdate(req.params.id, { $pull: { members: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $pull: { rooms: req.params.id } });
    res.json({ message: 'Left room' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;