const mongoose = require('mongoose');

const fileAttachmentSchema = new mongoose.Schema(
  {
    filename:    { type: String, required: true },
    url:         { type: String, required: true },
    fileType:    { type: String, required: true },  // 'avatar' | 'note-attachment' | 'room-cover' | 'message-file'
    size:        { type: Number, default: 0 },
    mimeType:    { type: String, default: '' },
    // one-to-many: User → Files (uploader)
    uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // optionally linked to a note or room
    linkedNote:  { type: mongoose.Schema.Types.ObjectId, ref: 'Note',  default: null },
    linkedRoom:  { type: mongoose.Schema.Types.ObjectId, ref: 'Room',  default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FileAttachment', fileAttachmentSchema);