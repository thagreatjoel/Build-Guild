const mongoose = require('mongoose');

const EventStatusSchema = new mongoose.Schema({
  isOpen: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EventStatus', EventStatusSchema);
