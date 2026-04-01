const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { sendQREmail } = require('../utils/email');
const EventStatus = require('../models/EventStatus');

// Get stats (total registered, total checked-in)
router.get('/stats', auth, async (req, res) => {
  try {
    const total = await User.countDocuments();
    const checkedIn = await User.countDocuments({ checkedIn: true });
    res.json({ total, checkedIn });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Scan QR token: mark check-in
router.post('/scan', auth, async (req, res) => {
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

// Manual walk-in registration
router.post('/manual-register', auth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    let existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ msg: 'Email already registered' });

    const qrToken = uuidv4();
    const user = new User({ name, email: email.toLowerCase(), phone, qrToken });
    await user.save();

    await sendQREmail(email, name, qrToken);
    res.json({ msg: 'Walk-in registered and QR sent', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all users
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete a user
router.delete('/users/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    await user.deleteOne();
    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Manual check-in by admin
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

    res.json({ msg: `${user.name || user.email} has been checked in successfully` });
  } catch (err) {
    console.error('Manual check-in error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add score to user
router.post('/add-score', auth, async (req, res) => {
  try {
    const { email, points } = req.body;
    if (!email) return res.status(400).json({ msg: 'Email required' });
    if (!points || isNaN(points)) return res.status(400).json({ msg: 'Valid points required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.score = (user.score || 0) + parseInt(points);
    await user.save();

    res.json({ msg: `Added ${points} points to ${user.name || user.email}`, newScore: user.score });
  } catch (err) {
    console.error('Add score error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get users with scores (sorted)
router.get('/users-with-scores', auth, async (req, res) => {
  try {
    const users = await User.find().sort({ score: -1, checkedInAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get event status
router.get('/event-status', async (req, res) => {
  let status = await EventStatus.findOne();
  if (!status) {
    status = new EventStatus({ isOpen: false });
    await status.save();
  }
  res.json({ isOpen: status.isOpen });
});

// Toggle event status
router.post('/event-status/toggle', auth, async (req, res) => {
  let status = await EventStatus.findOne();
  if (!status) {
    status = new EventStatus({ isOpen: false });
  }
  status.isOpen = !status.isOpen;
  status.updatedAt = new Date();
  await status.save();
  res.json({ isOpen: status.isOpen });
});


// Get users with scores (sorted)
router.get('/users-with-scores', auth, async (req, res) => {
  try {
    const users = await User.find().sort({ score: -1, checkedInAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Public leaderboard: only checked-in users with score > 0
router.get('/public-leaderboard', async (req, res) => {
  try {
    const users = await User.find({ checkedIn: true, score: { $gt: 0 } }).sort({ score: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});666666666666666666666666666666

module.exports = router;
