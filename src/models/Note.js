const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true },
    content:  { type: String, default: '' },
    subject:  { type: String, default: '' },
    tags:     [{ type: String }],
    isPinned: { type: Boolean, default: false },
    // one-to-many: User → Notes (author)
    author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // optionally linked to a room
    room:     { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
    // files attached to this note
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FileAttachment' }],
  },
  { timestamps: true }
);

// Text index for search
noteSchema.index({ title: 'text', content: 'text', subject: 'text' });

module.exports = mongoose.model('Note', noteSchema);