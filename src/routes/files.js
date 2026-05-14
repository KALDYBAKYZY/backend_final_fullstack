const express = require('express');
const FileAttachment = require('../models/FileAttachment');
const Note = require('../models/Note');
const { protect } = require('../middleware/auth');
const router = express.Router();

// POST /api/files  — save UploadThing result to DB
router.post('/', protect, async (req, res) => {
  try {
    const { filename, url, fileType, size, mimeType, linkedNote, linkedRoom } = req.body;
    const file = await FileAttachment.create({
      filename, url, fileType, size, mimeType,
      uploadedBy: req.user._id,
      linkedNote: linkedNote || null,
      linkedRoom: linkedRoom || null,
    });

    // If linked to a note, push into note.attachments
    if (linkedNote) {
      await Note.findByIdAndUpdate(linkedNote, { $addToSet: { attachments: file._id } });
    }

    res.status(201).json(file);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/files/my
router.get('/my', protect, async (req, res) => {
  try {
    const files = await FileAttachment.find({ uploadedBy: req.user._id }).sort('-createdAt');
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/files/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const file = await FileAttachment.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    if (file.uploadedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied' });
    await file.deleteOne();
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;