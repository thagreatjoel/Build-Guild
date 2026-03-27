const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { sendQREmail } = require('../utils/email');

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Email already registered' });

    const qrToken = uuidv4();
    const user = new User({ name, email, phone, qrToken });
    await user.save();

    await sendQREmail(email, name, qrToken);

    res.json({ msg: 'Registration successful! QR code sent to email.', userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/resend-qr', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    await sendQREmail(user.email, user.name, user.qrToken);
    res.json({ msg: 'QR code resent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/qr/:token', async (req, res) => {
  try {
    const user = await User.findOne({ qrToken: req.params.token });
    if (!user) return res.status(404).json({ msg: 'Invalid token' });
    const { generateQR } = require('../utils/qr');
    const qrDataUrl = await generateQR(user.qrToken);
    res.json({ qrDataUrl });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
