const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { sendQREmail } = require('../utils/email');

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    console.log(`Registration attempt: ${email}`);

    // Check for duplicate email
    let existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log(`Duplicate registration rejected: ${email}`);
      return res.status(400).json({ msg: 'Email already registered' });
    }

    const qrToken = uuidv4();
    const user = new User({ name, email: email.toLowerCase(), phone, qrToken });
    await user.save();
    console.log(`User saved to DB: ${user._id}`);

    // Send QR email (don't block registration on email failure)
    let emailStatus = { success: false };
    try {
      emailStatus = await sendQREmail(email, name, qrToken);
      if (emailStatus.success) {
        console.log(`QR email sent to: ${email}`);
      } else {
        console.warn(`Email failed but user was saved: ${emailStatus.error}`);
      }
    } catch (emailErr) {
      console.error('Unexpected email error:', emailErr);
    }

    // Always return success to user; they can still get QR via resend or pass page
    res.json({
      msg: emailStatus.success
        ? 'Registration successful! QR code sent to your email.'
        : 'Registration successful! However, there was an issue sending the email. Please use the "Resend QR" option.',
      userId: user._id,
      emailSent: emailStatus.success
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
});

router.post('/resend-qr', async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`Resend QR requested for: ${email}`);
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const emailResult = await sendQREmail(user.email, user.name, user.qrToken);
    if (emailResult.success) {
      console.log(`QR resent to: ${email}`);
      res.json({ msg: 'QR code resent successfully' });
    } else {
      console.error(`Resend failed for ${email}: ${emailResult.error}`);
      res.status(500).json({ msg: 'Failed to send email. Check server logs.' });
    }
  } catch (err) {
    console.error('Resend error:', err);
    res.status(500).json({ msg: 'Server error: ' + err.message });
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

module.exports = router;
