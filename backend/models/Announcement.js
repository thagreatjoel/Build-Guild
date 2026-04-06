const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  text: { type: String, default: 'Build Guild Kochi<br>April 15, 2026, 10:00 AM IST<br>Tinkerspace, Kochi' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);