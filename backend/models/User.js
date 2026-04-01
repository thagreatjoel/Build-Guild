const UserSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  qrToken: { type: String, default: '' },
  checkedIn: { type: Boolean, default: false },
  checkedInAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  loggedIn: { type: Boolean, default: false },
  lastLogin: { type: Date, default: null }
});
