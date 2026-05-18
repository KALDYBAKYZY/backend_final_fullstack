const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    content:   { type: String, required: true },
    type:      { type: String, enum: ['text', 'file', 'system'], default: 'text' },
    edited:    { type: Boolean, default: false },
    reactions: [{ emoji: String, userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
    sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room:      { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    fileAttachment: { type: mongoose.Schema.Types.ObjectId, ref: 'FileAttachment', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);