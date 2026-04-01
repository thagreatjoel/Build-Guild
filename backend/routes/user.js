
// Temporary OTP storage (in production use Redis or MongoDB)
const otpStore = new Map();

// Send OTP email
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email required' });
  
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  
  otpStore.set(email.toLowerCase(), { otp, expiresAt });
  
  // Send email using your existing transporter
  const { sendOTPEmail } = require('../utils/email');
  try {
    await sendOTPEmail(email, otp);
    console.log(`OTP sent to ${email}: ${otp}`);
    res.json({ msg: 'OTP sent to your email' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ msg: 'Failed to send OTP email' });
  }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ msg: 'Email and OTP required' });
  
  const record = otpStore.get(email.toLowerCase());
  if (!record) {
    return res.status(400).json({ msg: 'No OTP requested. Please request one.' });
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ msg: 'OTP expired. Request a new one.' });
  }
  if (record.otp !== otp) {
    return res.status(400).json({ msg: 'Invalid OTP' });
  }
  HEAD
  
  otpStore.delete(email.toLowerCase());
  res.json({ msg: 'OTP verified successfully' });
});

});



const net = require('net');

router.get('/test-smtp', async (req, res) => {
  const host = 'smtp.gmail.com';
  const port = 465;   // test SSL port
  const socket = new net.Socket();
  const timeout = 8000;
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
    res.status(500).json({ msg: `❌ Error connecting to ${host}:${port}: ${err.code || err.message}` });
  });
  socket.connect(port, host);
});


module.exports = router;

// Send OTP to email
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP temporarily (in production, use Redis or a temp collection)
  // For now, we'll just log it
  
  console.log(`OTP for ${email}: ${otp}`);
  
  // Send email with OTP
  const { sendOTPEmail } = require('../utils/email');
  try {
    await sendOTPEmail(email, otp);
    res.json({ msg: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to send OTP' });
  }
});
98d7990 (done1)
