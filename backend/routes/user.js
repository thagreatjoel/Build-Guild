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

    // Send QR email in the background – do NOT await
    sendQREmail(email, name, qrToken)
      .then(() => console.log(`QR email sent to: ${email}`))
      .catch((err) => console.error(`Email failed for ${email}:`, err.message));

    // Respond immediately – user doesn't have to wait for email
    res.json({ msg: 'Registration successful! QR code will arrive shortly.', userId: user._id });
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


// Test email endpoint – call with ?email=youraddress@example.com
router.get('/test-email', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ msg: 'Email required' });

    const testQR = 'test-token-123';
    await sendQREmail(email, 'Test User', testQR);
    res.json({ msg: 'Test email sent. Check your inbox/spam.' });
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ msg: err.message });
  }
});



const net = require('net');

router.get('/test-smtp', async (req, res) => {
  const host = 'smtp.gmail.com';
  const port = 587;
  const socket = new net.Socket();
  const timeout = 5000;
  socket.setTimeout(timeout);
  socket.on('connect', () => {
    socket.destroy();
    res.json({ msg: `✅ Successfully connected to ${host}:${port}` });
  });
  socket.on('timeout', () => {
    socket.destroy();
    res.status(500).json({ msg: `❌ Connection to ${host}:${port} timed out` });
  });
  socket.on('error', (err) => {
    socket.destroy();
    res.status(500).json({ msg: `❌ Error connecting to ${host}:${port}: ${err.message}` });
  });
  socket.connect(port, host);
});
module.exports = router;
