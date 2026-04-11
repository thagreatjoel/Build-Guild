const mongoose = require('mongoose');

const FoodRequestSchema = new mongoose.Schema({
  provider: { type: String, default: '' },
  itemNote: { type: String, default: '' },
  requestedAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNote: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  processedAt: { type: Date, default: null }
}, { _id: true });

const UserSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  username: { type: String, default: '' }, // no unique, no sparse
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  qrToken: { type: String, default: '' },
  assignedQrCode: { type: String, default: '' },
  checkedIn: { type: Boolean, default: false },
  checkedInAt: { type: Date, default: null },
  score: { type: Number, default: 0 },
  foodFundTotal: { type: Number, default: 5 },
  foodFundBalance: { type: Number, default: 5 },
  foodRequests: { type: [FoodRequestSchema], default: [] },
  profilePicture: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  loggedIn: { type: Boolean, default: false },
  lastLogin: { type: Date, default: null }
});

module.exports = mongoose.model('User', UserSchema);
