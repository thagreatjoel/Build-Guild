const nodemailer = require('nodemailer');
const { generateQR } = require('./qr');

// Create transporter based on environment
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendQREmail = async (userEmail, userName, qrToken) => {
  try {
    console.log(`Attempting to send QR to ${userEmail}`);
    const qrDataUrl = await generateQR(qrToken);
    
    const mailOptions = {
      from: `"Build Guild Kochi" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🎫 Your Build Guild Kochi QR Code',
      html: `
        <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0e305b; color: white;">
          <h1 style="color: #ffc857;">Hello ${userName}!</h1>
          <p>Thank you for registering for <strong>Build Guild Kochi</strong>.</p>
          <p>Here is your check-in QR code:</p>
          <div style="text-align: center; margin: 30px 0;">
            <img src="${qrDataUrl}" alt="QR Code" style="border: 2px solid #ffc857; padding: 10px; background: white;"/>
          </div>
          <p>Present this QR code at the entrance for scanning.</p>
          <hr style="border-color: #344b6a;">
          <p style="font-size: 12px; color: #dbe4ee;">Build Guild Kochi · April 13–19, 2025</p>
          <p style="font-size: 11px; margin-top: 20px;">If you did not receive this email, you can also access your QR code at: ${process.env.FRONTEND_URL}/pass.html?email=${encodeURIComponent(userEmail)}</p>
        </div>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${userEmail}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email sending failed:', err.message);
    console.error('Error details:', err);
    return { success: false, error: err.message };
  }
};

module.exports = { sendQREmail };
