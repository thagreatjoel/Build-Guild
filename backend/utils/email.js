const nodemailer = require('nodemailer');

// Elastic Email SMTP configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.elasticemail.com',
  port: 2525,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Send OTP email
const sendOTPEmail = async (userEmail, otp) => {
  try {
    console.log(`📧 Sending OTP to: ${userEmail}`);
    
    const mailOptions = {
      from: `"Build Guild Kochi" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🔐 Your OTP for Build Guild Kochi',
      html: `
        <div style="font-family: 'Poppins', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #0e305b; color: white; border-radius: 10px;">
          <h1 style="color: #ffc857; text-align: center;">Build Guild Kochi</h1>
          <h2 style="text-align: center;">Your OTP Code</h2>
          <div style="font-size: 40px; font-weight: bold; text-align: center; padding: 20px; background: #081c35; margin: 20px 0; letter-spacing: 8px; border-radius: 8px;">${otp}</div>
          <p>Use this code to access the event dashboard. It expires in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border-color: #344b6a;">
          <p style="font-size: 12px; text-align: center;">Build Guild Kochi · April 15, 2026 · Kochi, India</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${userEmail}`);
    return true;
  } catch (err) {
    console.error('❌ OTP email error:', err.message);
    throw new Error(`Failed to send OTP email: ${err.message}`);
  }
};

// Send QR email (optional - if still needed)
const sendQREmail = async (userEmail, userName, qrToken) => {
  try {
    console.log(`Preparing QR for: ${userEmail}`);
    const { generateQR } = require('./qr');
    const qrImage = await generateQR(qrToken);
    
    const mailOptions = {
      from: `"Build Guild Kochi" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🎫 Your Build Guild Kochi QR Code',
      html: `
        <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0e305b; color: white; border-radius: 10px;">
          <h1 style="color: #ffc857;">Hello ${userName}!</h1>
          <p>Thank you for registering for <strong>Build Guild Kochi</strong>.</p>
          <p>Here is your check-in QR code:</p>
          <div style="text-align: center; margin: 30px 0;">
            <img src="${qrImage}" alt="QR Code" style="border: 2px solid #ffc857; padding: 10px; background: white; border-radius: 8px;"/>
          </div>
          <p>Present this QR code at the entrance for scanning.</p>
          <hr style="border-color: #344b6a;">
          <p style="font-size: 12px;">Build Guild Kochi · April 15, 2026</p>
        </div>
      `,
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrImage.split(';base64,').pop(),
          encoding: 'base64',
          cid: 'qr-code',
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ QR email sent to ${userEmail}`);
  } catch (err) {
    console.error('❌ QR email error:', err.message);
    throw err;
  }
};

module.exports = { sendQREmail, sendOTPEmail };
