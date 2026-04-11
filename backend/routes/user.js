const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendOTPEmail } = require('../utils/email');
const {
  isApprovedEmail,
  addApprovedEmail,
  getAllApprovedEmails,
  getUsernameByEmail,
  getDisplayNameByEmail
} = require('../utils/emailList');

const otpStore = new Map();
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

function buildFoodQrPayload(user) {
  const latestRequest = Array.isArray(user.foodRequests) && user.foodRequests.length
    ? user.foodRequests[user.foodRequests.length - 1]
    : null;

  return {
    attendee: user.name || user.username || user.email.split('@')[0],
    email: user.email,
    physicalQrCode: user.assignedQrCode || '',
    checkedIn: !!user.checkedIn,
    foodFundBalance: Number((user.foodFundBalance ?? DEFAULT_FOOD_FUND).toFixed(2)),
    foodFundTotal: Number((user.foodFundTotal ?? DEFAULT_FOOD_FUND).toFixed(2)),
    latestFoodRequest: latestRequest ? {
      provider: latestRequest.provider,
      itemNote: latestRequest.itemNote,
      requestedAmount: latestRequest.requestedAmount,
      status: latestRequest.status,
      createdAt: latestRequest.createdAt
    } : null
  };
}

function formatFoodRequest(request) {
  return {
    id: request._id,
    provider: request.provider,
    itemNote: request.itemNote,
    requestedAmount: request.requestedAmount,
    status: request.status,
    adminNote: request.adminNote || '',
    createdAt: request.createdAt,
    processedAt: request.processedAt
  };
}

router.get('/approved-emails', (req, res) => {
  res.json({ emails: getAllApprovedEmails() });
});

router.post('/add-approved-email', (req, res) => {
  const { email, name, username } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email required' });
  if (addApprovedEmail(email, username, name)) {
    res.json({ msg: `Email ${email} added successfully` });
  } else {
    res.status(400).json({ msg: 'Email already exists' });
  }
});

router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email required' });

  if (!isApprovedEmail(email)) {
    return res.status(403).json({ msg: 'This email is not registered for this event.' });
  }

  const now = Date.now();
  const existing = otpStore.get(email.toLowerCase());

  if (existing && existing.expiresAt > now) {
    console.log(`Reusing OTP for ${email}: ${existing.otp}`);
    try {
      await sendOTPEmail(email, existing.otp);
      return res.json({
        msg: 'OTP resent (same code). Check your email.',
        otp: existing.otp
      });
    } catch (err) {
      console.error('Email error:', err);
      return res.json({
        msg: 'Email failed, but you can use this OTP for testing',
        otp: existing.otp
      });
    }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + 5 * 60 * 1000;
  otpStore.set(email.toLowerCase(), { otp, expiresAt });

  try {
    await sendOTPEmail(email, otp);
    console.log(`New OTP sent to ${email}: ${otp}`);
    res.json({
      msg: 'OTP sent to your email',
      otp
    });
  } catch (err) {
    console.error('Email error:', err);
    res.json({
      msg: 'Email sending failed, but you can use this OTP to login',
      otp,
      emailError: true
    });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ msg: 'Email and OTP required' });

  const record = otpStore.get(email.toLowerCase());
  if (!record) return res.status(400).json({ msg: 'No OTP requested. Please request one.' });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ msg: 'OTP expired. Request a new one.' });
  }
  if (record.otp !== otp) return res.status(400).json({ msg: 'Invalid OTP' });

  otpStore.delete(email.toLowerCase());

  let username = getUsernameByEmail(email);
  let displayName = getDisplayNameByEmail(email);
  const fallbackName = email.split('@')[0];

  if (!username || username.trim() === '') {
    username = fallbackName;
  }
  if (!displayName || displayName.trim() === '') {
    displayName = username;
  }

  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = new User({
        email: email.toLowerCase(),
        name: displayName,
        username,
        phone: '',
        qrToken: '',
        assignedQrCode: '',
        checkedIn: false,
        loggedIn: true,
        lastLogin: new Date(),
        score: 0,
        foodFundTotal: DEFAULT_FOOD_FUND,
        foodFundBalance: DEFAULT_FOOD_FUND,
        foodRequests: [],
        profilePicture: ''
      });
      await user.save();
      console.log(`✅ New user created: ${email} (${username})`);
    } else {
      user.loggedIn = true;
      user.lastLogin = new Date();
      if (!user.username && username) user.username = username;
      if (!user.name && displayName) user.name = displayName;
      normalizeFoodState(user);
      await user.save();
      console.log(`✅ User updated: ${email}`);
    }
    res.json({
      msg: 'OTP verified successfully',
      username,
      displayName,
      email
    });
  } catch (err) {
    console.error('❌ Error saving user:', err);
    res.status(500).json({ msg: 'Login succeeded but failed to save user data. Please try again or contact support.' });
  }
});

router.post('/login-status', async (req, res) => {
  const { email, loggedIn } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email required' });

  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = new User({
        email: email.toLowerCase(),
        name: email.split('@')[0],
        username: email.split('@')[0],
        loggedIn: loggedIn || false,
        lastLogin: loggedIn ? new Date() : null,
        foodFundTotal: DEFAULT_FOOD_FUND,
        foodFundBalance: DEFAULT_FOOD_FUND,
        foodRequests: []
      });
      await user.save();
      console.log(`Created user from login-status: ${email}`);
    } else {
      user.loggedIn = loggedIn || false;
      user.lastLogin = loggedIn ? new Date() : null;
      normalizeFoodState(user);
      await user.save();
      console.log(`Updated login status for ${email}: loggedIn=${loggedIn}`);
    }
    res.json({ msg: 'Login status updated' });
  } catch (err) {
    console.error('Error updating login status:', err);
    res.status(500).json({ msg: 'Failed to update login status' });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({ checkedIn: true, score: { $gt: 0 } })
      .sort({ score: -1 })
      .select('name username email score profilePicture');
    res.json(users);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/profile', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ msg: 'Email required' });
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const changed = normalizeFoodState(user);
    if (changed) await user.save();

    res.json({
      name: user.name,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      score: user.score,
      checkedIn: user.checkedIn,
      assignedQrCode: user.assignedQrCode || '',
      foodFundTotal: user.foodFundTotal,
      foodFundBalance: user.foodFundBalance,
      foodRequests: user.foodRequests
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(formatFoodRequest),
      qrPayload: buildFoodQrPayload(user)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/event-note', async (req, res) => {
  const EventNote = require('../models/EventNote');
  let note = await EventNote.findOne();
  if (!note) note = new EventNote();
  res.json({ text: note.text });
});

router.post('/update-profile', async (req, res) => {
  const { email, name, profilePicture } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email required' });

  try {
    const update = {};
    if (name) update.name = name;
    if (profilePicture) update.profilePicture = profilePicture;

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      update,
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ msg: 'User not found' });
    normalizeFoodState(user);
    await user.save();
    res.json({ msg: 'Profile updated', user: { name: user.name, profilePicture: user.profilePicture } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/food-request', async (req, res) => {
  const { email, provider, itemNote, requestedAmount } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email required' });
  if (!provider || !provider.trim()) return res.status(400).json({ msg: 'Food source is required' });
  if (!itemNote || !itemNote.trim()) return res.status(400).json({ msg: 'Food note is required' });

  const amount = Number(requestedAmount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ msg: 'Valid request amount required' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    normalizeFoodState(user);

    const hasPending = user.foodRequests.some((request) => request.status === 'pending');
    if (hasPending) {
      return res.status(400).json({ msg: 'You already have a pending food request' });
    }

    if (amount > user.foodFundBalance) {
      return res.status(400).json({ msg: 'Requested amount is higher than your remaining food fund' });
    }

    user.foodRequests.push({
      provider: provider.trim(),
      itemNote: itemNote.trim(),
      requestedAmount: Number(amount.toFixed(2)),
      status: 'pending'
    });
    await user.save();

    const latestRequest = user.foodRequests[user.foodRequests.length - 1];
    res.json({
      msg: 'Food request sent to admin',
      request: formatFoodRequest(latestRequest),
      foodFundBalance: user.foodFundBalance,
      qrPayload: buildFoodQrPayload(user)
    });
  } catch (err) {
    console.error('Food request error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/announcement', async (req, res) => {
  try {
    const Announcement = require('../models/Announcement');
    let announcement = await Announcement.findOne();
    if (!announcement) {
      announcement = new Announcement();
      await announcement.save();
    }
    res.json({ text: announcement.text });
  } catch (err) {
    console.error('Announcement route error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
