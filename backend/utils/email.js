const nodemailer = require('nodemailer');
const { generateQR } = require('./qr');

// Force IPv4 to avoid ENETUNREACH
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,          // use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  family: 4,              // force IPv4
});

const sendQREmail = async (userEmail, userName, qrToken) => {
  try {
    console.log(`Preparing QR for: ${userEmail}`);
    const qrImage = await generateQR(qrToken);
    console.log(`QR generated successfully`);

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
            <img src="${qrImage}" alt="QR Code" style="border: 2px solid #ffc857; padding: 10px; background: white;"/>
          </div>
          <p>Present this QR code at the entrance for scanning.</p>
          <hr style="border-color: #344b6a;">
          <p style="font-size: 12px; color: #dbe4ee;">Build Guild Kochi · April 13–19, 2025</p>
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

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${userEmail}. Message ID: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`Email error for ${userEmail}:`, err.message);
    if (err.code) console.error('Error code:', err.code);
    // Rethrow so the caller knows it failed (though registration already succeeded)
    throw err;
  }
};

module.exports = { sendQREmail };