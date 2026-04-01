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
