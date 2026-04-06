const mongoose = require('mongoose');

const EventNoteSchema = new mongoose.Schema({
  text: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EventNote', EventNoteSchema);