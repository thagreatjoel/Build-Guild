// Send OTP email
const sendOTPEmail = async (userEmail, otp) => {
  const mailOptions = {
    from: `"Build Guild Kochi" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: '🔐 Your OTP for Build Guild Kochi',
    html: `
      <div style="font-family: 'Poppins', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #0e305b; color: white;">
        <h1 style="color: #ffc857;">Your OTP Code</h1>
        <p>Use the following code to access the event dashboard:</p>
        <div style="font-size: 36px; font-weight: bold; text-align: center; padding: 20px; background: #081c35; margin: 20px 0; letter-spacing: 5px;">${otp}</div>
        <p>This code expires in 10 minutes.</p>
        <hr style="border-color: #344b6a;">
        <p style="font-size: 12px;">Build Guild Kochi · April 15, 2026</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = { sendQREmail, sendOTPEmail };