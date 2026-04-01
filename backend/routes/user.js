const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { sendQREmail, sendOTPEmail } = require('../utils/email');

// ========== USER REGISTRATION & QR ==========
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    console.log(`Registration attempt: ${email}`);

    let existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ msg: 'Email already registered' });
    }

    const qrToken = uuidv4();
    const user = new User({ name, email: email.toLowerCase(), phone, qrToken });
    await user.save();

    sendQREmail(email, name, qrToken).catch(err => console.error(`Email error: ${err.message}`));

    res.json({ msg: 'Registration successful! QR code will arrive shortly.', userId: user._id });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
});

router.post('/resend-qr', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    await sendQREmail(user.email, user.name, user.qrToken);
    res.json({ msg: 'QR code resent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/by-email', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ msg: 'Email required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ========== OTP ROUTES ==========
// Temporary OTP storage (in‑memory)
const otpStore = new Map(); // key: email, value: { otp, expiresAt }

// Send OTP – reuse if still valid
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email required' });

  const now = Date.now();
  const existing = otpStore.get(email.toLowerCase());

  if (existing && existing.expiresAt > now) {
    // OTP still valid – reuse it
    console.log(`Reusing OTP for ${email}: ${existing.otp}`);
    try {
      await sendOTPEmail(email, existing.otp);
      res.json({ msg: 'OTP resent (same code). Check your email.' });
    } catch (err) {
      console.error('Email error:', err);
      res.status(500).json({ msg: 'Failed to resend OTP' });
    }
    return;
  }

  // Generate new OTP (valid for 5 minutes)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + 5 * 60 * 1000; // 5 minutes
  otpStore.set(email.toLowerCase(), { otp, expiresAt });

  try {
    await sendOTPEmail(email, otp);
    console.log(`New OTP sent to ${email}: ${otp}`);
    res.json({ msg: 'OTP sent to your email' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ msg: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ msg: 'Email and OTP required' });

  const record = otpStore.get(email.toLowerCase());
  if (!record) return res.status(400).json({ msg: 'No OTP requested. Please request one.' });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ msg: 'OTP expired. Request a new one.' });
  }
  if (record.otp !== otp) return res.status(400).json({ msg: 'Invalid OTP' });

  otpStore.delete(email.toLowerCase()); // remove after successful use
  res.json({ msg: 'OTP verified successfully' });
});
// Mark user as logged in (store in MongoDB)
router.post('/login-status', async (req, res) => {
  const { email, loggedIn } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email required' });

  try {
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        lastLogin: loggedIn ? new Date() : null,
        loggedIn: loggedIn || false
      },
      { upsert: true, new: true }
    );
    res.json({ msg: 'Login status updated' });
  } catch (err) {
    console.error('Error updating login status:', err);
    res.status(500).json({ msg: 'Failed to update login status' });
  }
});

module.exports = router;
