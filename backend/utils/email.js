const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (userEmail, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Resend's default verified domain
      to: userEmail,
      subject: '🔐 Your OTP for Build Guild Kochi',
      html: `
        <div style="font-family: 'Poppins', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #0e305b; color: white; border-radius: 10px;">
          <h1 style="color: #ffc857;">Build Guild Kochi</h1>
          <h2>Your OTP Code</h2>
          <div style="font-size: 40px; font-weight: bold; text-align: center; padding: 20px; background: #081c35; margin: 20px 0; letter-spacing: 8px;">${otp}</div>
          <p>This code expires in 10 minutes.</p>
          <p style="font-size: 12px;">Build Guild Kochi · April 15, 2026</p>
        </div>
      `,
    });

    if (error) throw new Error(error.message);
    console.log(`✅ OTP sent to ${userEmail}`);
  } catch (err) {
    console.error('❌ OTP email error:', err.message);
    throw new Error(`Failed to send OTP: ${err.message}`);
  }
};

// If you still need QR emails (optional), keep a stub
const sendQREmail = async () => {};

module.exports = { sendOTPEmail, sendQREmail };
