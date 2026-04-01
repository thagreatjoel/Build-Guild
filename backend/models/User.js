const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  username: { type: String, default: '', unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  qrToken: { type: String, default: '' },
  checkedIn: { type: Boolean, default: false },
  checkedInAt: { type: Date, default: null },
  score: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  loggedIn: { type: Boolean, default: false },
  lastLogin: { type: Date, default: null }
});

module.exports = mongoose.model('User', UserSchema);
