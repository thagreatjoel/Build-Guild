const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { sendOTPEmail } = require('../utils/email');
const { isApprovedEmail, addApprovedEmail, getAllApprovedEmails, getUsernameByEmail, getDisplayNameByEmail } = require('../utils/emailList');

// Temporary OTP storage
const otpStore = new Map();

// ========== EMAIL MANAGEMENT ==========
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

// ========== OTP ROUTES ==========
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
      otp: otp
    });
  } catch (err) {
    console.error('Email error:', err);
    res.json({ 
      msg: 'Email sending failed, but you can use this OTP to login',
      otp: otp,
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

  const username = getUsernameByEmail(email);
  const displayName = getDisplayNameByEmail(email);

  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = new User({
        email: email.toLowerCase(),
        name: displayName || username || email.split('@')[0],
        username: username || email.split('@')[0],
        phone: '',
        qrToken: '',
        checkedIn: false,
        loggedIn: true,
        lastLogin: new Date()
      });
      await user.save();
      console.log(`✅ New user created: ${email} (${displayName || username})`);
    } else {
      user.loggedIn = true;
      user.lastLogin = new Date();
      if (!user.username && username) user.username = username;
      if (!user.name && displayName) user.name = displayName;
      await user.save();
    }
  } catch (err) {
    console.error('Error updating user:', err);
  }

  res.json({ 
    msg: 'OTP verified successfully',
    username: username || email.split('@')[0],
    displayName: displayName || username || email.split('@')[0],
    email: email
  });
});

// ========== LOGIN STATUS ==========
router.post('/login-status', async (req, res) => {
  const { email, loggedIn } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email required' });

  try {
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { lastLogin: loggedIn ? new Date() : null, loggedIn: loggedIn || false },
      { upsert: true, new: true }
    );
    res.json({ msg: 'Login status updated' });
  } catch (err) {
    console.error('Error updating login status:', err);
    res.status(500).json({ msg: 'Failed to update login status' });
  }
});


// Public leaderboard: only checked-in users with score > 0
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({ checkedIn: true, score: { $gt: 0 } })
      .sort({ score: -1 })
      .select('name username email score');
    res.json(users);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


module.exports = router;
