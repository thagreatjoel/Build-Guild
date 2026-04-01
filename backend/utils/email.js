const nodemailer = require('nodemailer');

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendOTPEmail = async (userEmail, otp) => {
  try {
    console.log(`📧 Attempting to send OTP to: ${userEmail}`);
    
    const mailOptions = {
      from: `"Build Guild Kochi" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🔐 Your OTP for Build Guild Kochi',
      html: `
        <div style="font-family: 'Poppins', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #0e305b; color: white; border-radius: 10px;">
          <h1 style="color: #ffc857; text-align: center;">Build Guild Kochi</h1>
          <h2 style="text-align: center;">Your OTP Code</h2>
          <div style="font-size: 40px; font-weight: bold; text-align: center; padding: 20px; background: #081c35; margin: 20px 0; letter-spacing: 8px; border-radius: 8px;">${otp}</div>
          <p style="text-align: center;">Use this code to access the event dashboard. It expires in <strong>5 minutes</strong>.</p>
          <p style="text-align: center;">If you didn't request this, please ignore this email.</p>
          <hr style="border-color: #344b6a;">
          <p style="font-size: 12px; text-align: center;">Build Guild Kochi · April 15, 2026 · Kochi, India</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${userEmail}`);
    console.log(`📨 Message ID: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error('❌ OTP email error:', err.message);
    console.error('Full error:', err);
    throw new Error(`Failed to send OTP: ${err.message}`);
  }
};

module.exports = { sendOTPEmail };
