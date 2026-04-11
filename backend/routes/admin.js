const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { sendQREmail } = require('../utils/email');
const EventStatus = require('../models/EventStatus');

const DEFAULT_FOOD_FUND = 5;

function normalizeFoodState(user) {
  let changed = false;

  if (typeof user.foodFundTotal !== 'number') {
    user.foodFundTotal = DEFAULT_FOOD_FUND;
    changed = true;
  }
  if (typeof user.foodFundBalance !== 'number') {
    user.foodFundBalance = user.foodFundTotal;
    changed = true;
  }
  if (!Array.isArray(user.foodRequests)) {
    user.foodRequests = [];
    changed = true;
  }
  if (typeof user.assignedQrCode !== 'string') {
    user.assignedQrCode = '';
    changed = true;
  }

  return changed;
}

function serializeFoodRequest(user, request) {
  return {
    id: request._id,
    userId: user._id,
    name: user.name || user.username || user.email.split('@')[0],
    username: user.username || '',
    email: user.email,
    assignedQrCode: user.assignedQrCode || '',
    provider: request.provider,
    itemNote: request.itemNote,
    requestedAmount: request.requestedAmount,
    status: request.status,
    adminNote: request.adminNote || '',
    createdAt: request.createdAt,
    processedAt: request.processedAt,
    foodFundBalance: user.foodFundBalance,
    foodFundTotal: user.foodFundTotal
  };
}

async function normalizeAllUsers(users) {
  await Promise.all(users.map(async (user) => {
    if (normalizeFoodState(user)) {
      await user.save();
    }
  }));
}

router.get('/stats', auth, async (req, res) => {
  try {
    const total = await User.countDocuments();
    const checkedIn = await User.countDocuments({ checkedIn: true });
    const pendingFoodRequests = await User.countDocuments({ 'foodRequests.status': 'pending' });
    res.json({ total, checkedIn, pendingFoodRequests });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

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

router.post('/manual-register', auth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    let existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ msg: 'Email already registered' });

    const qrToken = uuidv4();
    const user = new User({
      name,
      email: email.toLowerCase(),
      phone,
      qrToken,
      foodFundTotal: DEFAULT_FOOD_FUND,
      foodFundBalance: DEFAULT_FOOD_FUND,
      foodRequests: []
    });
    await user.save();

    await sendQREmail(email, name, qrToken);
    res.json({ msg: 'Walk-in registered and QR sent', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    await normalizeAllUsers(users);
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

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

router.post('/add-score', auth, async (req, res) => {
  try {
    const { email, points } = req.body;
    if (!email) return res.status(400).json({ msg: 'Email required' });
    if (points === undefined || points === null || isNaN(points)) {
      return res.status(400).json({ msg: 'Valid numeric points required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.score = (user.score || 0) + parseInt(points, 10);
    await user.save();

    res.json({ msg: `Added ${points} points to ${user.name || user.email}`, newScore: user.score });
  } catch (err) {
    console.error('Add score error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/assign-physical-qr', auth, async (req, res) => {
  try {
    const { email, assignedQrCode } = req.body;
    if (!email) return res.status(400).json({ msg: 'Email required' });
    if (!assignedQrCode || !assignedQrCode.trim()) return res.status(400).json({ msg: 'Physical QR code is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.assignedQrCode = assignedQrCode.trim().toUpperCase();
    normalizeFoodState(user);
    await user.save();

    res.json({ msg: 'Physical QR code assigned', assignedQrCode: user.assignedQrCode });
  } catch (err) {
    console.error('Assign physical QR error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/food-requests', auth, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    await normalizeAllUsers(users);

    const requests = users
      .flatMap((user) => user.foodRequests.map((request) => serializeFoodRequest(user, request)))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(requests);
  } catch (err) {
    console.error('Food request list error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/food-requests/:requestId/process', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Valid status is required' });
    }

    const user = await User.findOne({ 'foodRequests._id': requestId });
    if (!user) return res.status(404).json({ msg: 'Food request not found' });

    normalizeFoodState(user);

    const request = user.foodRequests.id(requestId);
    if (!request) return res.status(404).json({ msg: 'Food request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ msg: 'This food request has already been processed' });
    }

    if (status === 'approved' && request.requestedAmount > user.foodFundBalance) {
      return res.status(400).json({ msg: 'User does not have enough food fund balance left' });
    }

    request.status = status;
    request.adminNote = (adminNote || '').trim();
    request.processedAt = new Date();

    if (status === 'approved') {
      user.foodFundBalance = Number((user.foodFundBalance - request.requestedAmount).toFixed(2));
      if (user.foodFundBalance < 0) user.foodFundBalance = 0;
    }

    await user.save();

    res.json({
      msg: status === 'approved' ? 'Food request approved and deducted from fund' : 'Food request rejected',
      request: serializeFoodRequest(user, request),
      foodFundBalance: user.foodFundBalance
    });
  } catch (err) {
    console.error('Food request process error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/users-with-scores', auth, async (req, res) => {
  try {
    const users = await User.find().sort({ score: -1, checkedInAt: -1 });
    await normalizeAllUsers(users);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/event-status', async (req, res) => {
  let status = await EventStatus.findOne();
  if (!status) {
    status = new EventStatus({ isOpen: false });
    await status.save();
  }
  res.json({ isOpen: status.isOpen });
});

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

router.get('/public-leaderboard', async (req, res) => {
  try {
    const users = await User.find({ checkedIn: true, score: { $gt: 0 } }).sort({ score: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/announcement', auth, async (req, res) => {
  const { text } = req.body;
  try {
    const Announcement = require('../models/Announcement');
    let announcement = await Announcement.findOne();
    if (!announcement) announcement = new Announcement();
    announcement.text = text;
    announcement.updatedAt = new Date();
    await announcement.save();
    res.json({ msg: 'Announcement updated', text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/event-note', auth, async (req, res) => {
  const EventNote = require('../models/EventNote');
  let note = await EventNote.findOne();
  if (!note) note = new EventNote();
  res.json({ text: note.text });
});

router.post('/event-note', auth, async (req, res) => {
  const { text } = req.body;
  const EventNote = require('../models/EventNote');
  let note = await EventNote.findOne();
  if (!note) note = new EventNote();
  note.text = text;
  note.updatedAt = new Date();
  await note.save();
  res.json({ msg: 'Note updated', text });
});

module.exports = router;
