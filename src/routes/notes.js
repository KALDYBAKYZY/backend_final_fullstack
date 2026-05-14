const express = require('express');
const Note = require('../models/Note');
const { protect } = require('../middleware/auth');
const { escapeRegex } = require('../utils/helpers');
const router = express.Router();

// GET /api/notes?search=&subject=&roomId=
router.get('/', protect, async (req, res) => {
  try {
    const { search, subject, roomId } = req.query;
    const filter = { author: req.user._id };
    if (search) filter.$text = { $search: search };
    if (subject) filter.subject = subject;
    if (roomId) filter.room = roomId;

    const notes = await Note.find(filter)
      .populate('attachments')
      .populate('room', 'name subject')
      .sort('-updatedAt');
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/notes/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('attachments')
      .populate('room', 'name subject');
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.author._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/notes
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, subject, tags, room, isPinned } = req.body;
    const note = await Note.create({ title, content, subject, tags, room, isPinned, author: req.user._id });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/notes/:id
router.patch('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied' });

    Object.assign(note, req.body);
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied' });
    await note.deleteOne();
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;