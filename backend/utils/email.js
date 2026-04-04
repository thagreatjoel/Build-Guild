const nodemailer = require("nodemailer");

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "kochi@blueprint.hackclub.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Send OTP Email
const sendOTPEmail = async (userEmail, otp) => {
  try {
    await transporter.sendMail({
      from: '"Build Guild Kochi" <kochi@blueprint.hackclub.com>',
      to: userEmail,
      subject: "OTP for Build Guild Kochi",
      html: `
      <div style="margin:0; padding:30px; background:#0e305b; font-family:Poppins, Arial, sans-serif;">

        <div style="
          max-width:500px;
          margin:auto;
          padding:28px;
          border-radius:12px;
          background:#0e305b;
          color:#ffffff;
          background-image:
            linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
          background-size:50px 50px;
        ">

          <h1 style="margin:0; text-align:center; font-size:22px; font-weight:800;">
            Build Guild <span style="color:#ffc857;">Kochi</span>
          </h1>

          <p style="margin:18px 0 6px; text-align:center; font-size:14px; color:#b8c7db;">
            Secure access verification
          </p>

          <div style="text-align:center; margin:20px 0 24px;">
            <span style="
              display:inline-block;
              font-size:38px;
              letter-spacing:10px;
              font-weight:700;
              padding:18px 26px;
              border-radius:10px;
              background:#081c35;
              border:1px solid rgba(255,255,255,0.1);
            ">
              ${otp}
            </span>
          </div>

          <p style="text-align:center; font-size:13px; color:#b8c7db; margin:0;">
            This code is valid for <strong>5 minutes</strong> and can be used only once.
          </p>

          <div style="margin:20px 0; padding:14px; border-radius:8px; background:rgba(255,255,255,0.04); font-size:12px; color:#9fb3d1;">
            <p style="margin:0;">Requested for: <strong>${userEmail}</strong></p>
            <p style="margin:6px 0 0;">Time: <strong>${new Date().toLocaleString()}</strong></p>
          </div>

          <p style="text-align:center; font-size:12px; color:#8ea2c0; margin:0;">
            If you did not request this code, you can safely ignore this email.
          </p>

          <hr style="margin:24px 0; border:none; border-top:1px solid rgba(255,255,255,0.1);">

          <p style="text-align:center; font-size:11px; color:#6f86a8; margin:0;">
            Build Guild Kochi · April 15, 2026 · Kochi, India
          </p>

        </div>
      </div>
      `
    });

    console.log(`✅ OTP email sent to ${userEmail}`);
    return true;

  } catch (err) {
    console.error("❌ OTP email error:", err.message);
    throw err;
  }
};

module.exports = { sendOTPEmail };