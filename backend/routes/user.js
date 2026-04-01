const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { sendQREmail, sendOTPEmail } = require('../utils/email');
const { isApprovedEmail, addApprovedEmail, getAllApprovedEmails } = require('../utils/emailList');

// Temporary OTP storage (in-memory)
const otpStore = new Map();

// ========== EMAIL MANAGEMENT (Admin Routes) ==========

// Get all approved emails (admin only)
router.get('/approved-emails', (req, res) => {
  res.json({ emails: getAllApprovedEmails() });
});

// Add new approved email (admin only)
router.post('/add-approved-email', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email required' });
  if (addApprovedEmail(email)) {
    res.json({ msg: `Email ${email} added successfully` });
  } else {
    res.status(400).json({ msg: 'Email already exists' });
  }
});

// Check if email is approved
router.post('/check-email', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email required' });
  res.json({ approved: isApprovedEmail(email) });
});

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

// Send OTP (with email approval check and 5-minute reuse)
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email required' });

  // Check if email is approved
  if (!isApprovedEmail(email)) {
    return res.status(403).json({ msg: 'This email is not registered for this event.' });
  }

  const now = Date.now();
  const existing = otpStore.get(email.toLowerCase());

  if (existing && existing.expiresAt > now) {
    // OTP still valid – reuse it
    console.log(`Reusing OTP for ${email}: ${existing.otp}`);
    try {
      await sendOTPEmail(email, existing.otp);
      return res.json({ 
        msg: 'OTP resent (same code). Check your email.',
        otp: existing.otp  // Include OTP in response for debugging
      });
    } catch (err) {
      console.error('Email error:', err);
      return res.status(500).json({ msg: 'Failed to resend OTP' });
    }
  }

  // Generate new OTP (valid for 5 minutes)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + 5 * 60 * 1000;
  otpStore.set(email.toLowerCase(), { otp, expiresAt });

  try {
    await sendOTPEmail(email, otp);
    console.log(`New OTP sent to ${email}: ${otp}`);
    res.json({ 
      msg: 'OTP sent to your email',
      otp: otp  // Include OTP in response for debugging
    });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ msg: 'Failed to send OTP' });
  }
});

// Verify OTP and create user in MongoDB if needed
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

  // Import username functions
  const { getUsernameByEmail, getDisplayNameByEmail } = require('../utils/emailList');
  
  // Get username and display name
  const username = getUsernameByEmail(email);
  const displayName = getDisplayNameByEmail(email);

  // Ensure user exists in MongoDB for check-in tracking
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
      console.log(`✅ New user created from OTP login: ${email} (${displayName})`);
    } else {
      // Update login status and username if changed
      user.loggedIn = true;
      user.lastLogin = new Date();
      if (!user.username && username) user.username = username;
      if (!user.name && displayName) user.name = displayName;
      await user.save();
    }
  } catch (err) {
    console.error('Error creating/updating user:', err);
    // Still return success for OTP even if user save fails
  }

  // Return username and display name with success response
  res.json({ 
    msg: 'OTP verified successfully',
    username: username,
    displayName: displayName,
    email: email
  });
});
// Mark user as logged in (for session tracking)
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
