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
  
  otpStore.delete(email.toLowerCase());
  res.json({ msg: 'OTP verified successfully' });
});