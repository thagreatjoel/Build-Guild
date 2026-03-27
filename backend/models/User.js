const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  qrToken: { type: String, required: true, unique: true },
  checkedIn: { type: Boolean, default: false },
  checkedInAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
