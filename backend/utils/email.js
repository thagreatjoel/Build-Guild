const nodemailer = require('nodemailer');
const { generateQR } = require('./qr');

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendQREmail = async (userEmail, userName, qrToken) => {
  const qrImage = await generateQR(qrToken);
  const mailOptions = {
    from: '"Event Check-in" <noreply@event.com>',
    to: userEmail,
    subject: 'Your Event QR Code',
    html: `
      <h1>Hello ${userName},</h1>
      <p>Thank you for registering. Here is your QR code for check-in:</p>
      <img src="${qrImage}" alt="QR Code" />
      <p>You can also download the QR code from your profile.</p>
    `,
    attachments: [
      {
        filename: 'qrcode.png',
        content: qrImage.split(';base64,').pop(),
        encoding: 'base64',
        cid: 'unique@nodemailer.com',
      },
    ],
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendQREmail };
