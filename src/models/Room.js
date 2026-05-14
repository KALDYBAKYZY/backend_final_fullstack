const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    subject:     { type: String, required: true },
    isPrivate:   { type: Boolean, default: false },
    coverImage:  { type: String, default: '' },
    // one-to-many owner: User → Room (owner)
    owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // many-to-many members: Users ↔ Rooms
    members:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags:        [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);