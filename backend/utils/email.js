const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (userEmail, otp) => {
  try {
    console.log(`📧 Sending OTP to: ${userEmail}`);
    
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Resend's default verified domain
      to: userEmail,
      subject: '🔐 Your OTP for Build Guild Kochi',
      html: `
        <div style="font-family: 'Poppins', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #0e305b; color: white; border-radius: 10px;">
          <h1 style="color: #ffc857; text-align: center;">Build Guild Kochi</h1>
          <h2 style="text-align: center;">Your OTP Code</h2>
          <div style="font-size: 40px; font-weight: bold; text-align: center; padding: 20px; background: #081c35; margin: 20px 0; letter-spacing: 8px; border-radius: 8px;">${otp}</div>
          <p style="text-align: center;">Use this code to access the event dashboard. It expires in <strong>10 minutes</strong>.</p>
          <p style="text-align: center;">If you didn't request this, please ignore this email.</p>
          <hr style="border-color: #344b6a;">
          <p style="font-size: 12px; text-align: center;">Build Guild Kochi · April 15, 2026 · Kochi, India</p>
        </div>
      `,
    });

    if (error) throw new Error(error.message);
    console.log(`✅ OTP sent to ${userEmail}`);
    return true;
  } catch (err) {
    console.error('❌ OTP email error:', err.message);
    throw new Error(`Failed to send OTP: ${err.message}`);
  }
};

// Keep QR email function for compatibility (if needed)
const sendQREmail = async () => {
  console.log('QR email function called but not implemented');
  return true;
};

module.exports = { sendOTPEmail, sendQREmail };
