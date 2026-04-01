const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { sendQREmail } = require('../utils/email');

router.use(auth);

router.get('/stats', async (req, res) => {
  try {
    const total = await User.countDocuments();
    const checkedIn = await User.countDocuments({ checkedIn: true });
    res.json({ total, checkedIn });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/scan', async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ qrToken: token });
    if (!user) return res.status(404).json({ msg: 'Invalid QR code' });
    if (user.checkedIn) return res.status(400).json({ msg: 'Already checked in' });

    user.checkedIn = true;
    user.checkedInAt = new Date();
    await user.save();

    res.json({ msg: 'Checked in successfully', user });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/manual-register', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Email already registered' });

    const qrToken = uuidv4();
    const user = new User({ name, email, phone, qrToken });
    await user.save();

    await sendQREmail(email, name, qrToken);
    res.json({ msg: 'Walk-in registered and QR sent', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get event status
router.get('/event-status', async (req, res) => {
  const EventStatus = require('../models/EventStatus');
  let status = await EventStatus.findOne();
  if (!status) {
    status = new EventStatus({ isOpen: false });
    await status.save();
  }
  res.json({ isOpen: status.isOpen });
});

// Toggle event status (admin only)
router.post('/event-status/toggle', async (req, res) => {
  const EventStatus = require('../models/EventStatus');
  let status = await EventStatus.findOne();
  if (!status) {
    status = new EventStatus({ isOpen: false });
  }
  status.isOpen = !status.isOpen;
  status.updatedAt = new Date();
  await status.save();
  res.json({ isOpen: status.isOpen });
});

// Manual check-in by admin (mark user as checked in)
router.post('/manual-checkin', auth, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: 'Email required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (user.checkedIn) {
      return res.status(400).json({ msg: 'User already checked in' });
    }

    user.checkedIn = true;
    user.checkedInAt = new Date();
    await user.save();

    res.json({ msg: `${user.name} has been checked in successfully` });
  } catch (err) {
    console.error('Manual check-in error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


module.exports = router; 
