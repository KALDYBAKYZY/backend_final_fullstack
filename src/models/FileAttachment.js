const mongoose = require('mongoose');

const fileAttachmentSchema = new mongoose.Schema(
  {
    filename:    { type: String, required: true },
    url:         { type: String, required: true },
    fileType:    { type: String, required: true }, 
    size:        { type: Number, default: 0 },
    mimeType:    { type: String, default: '' },
    uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    linkedNote:  { type: mongoose.Schema.Types.ObjectId, ref: 'Note',  default: null },
    linkedRoom:  { type: mongoose.Schema.Types.ObjectId, ref: 'Room',  default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FileAttachment', fileAttachmentSchema);