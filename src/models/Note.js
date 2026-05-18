const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true },
    content:  { type: String, default: '' },
    subject:  { type: String, default: '' },
    tags:     [{ type: String }],
    isPinned: { type: Boolean, default: false },
    author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room:     { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FileAttachment' }],
  },
  { timestamps: true }
);

noteSchema.index({ title: 'text', content: 'text', subject: 'text' });

module.exports = mongoose.model('Note', noteSchema);