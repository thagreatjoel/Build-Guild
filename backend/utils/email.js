const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (userEmail, otp) => {
  try {
    console.log(`Attempting to send OTP to: ${userEmail}`);

const { data, error } = await resend.emails.send({
  from: 'joel@thagreatjoel.me',
  to: userEmail,
  subject: 'Your OTP for Build Guild Kochi',
  html: `
    <div style="margin:0; padding:0; background:#0b1f3a; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">

      <div style="max-width:500px; margin:40px auto; padding:28px; background:#0e305b; border-radius:12px; box-shadow:0 12px 30px rgba(0,0,0,0.3); color:#e6edf6;">

        <h1 style="margin:0; font-size:20px; font-weight:600; text-align:center; color:#ffc857; letter-spacing:0.5px;">
          Build Guild Kochi
        </h1>

        <p style="margin:24px 0 6px; font-size:14px; text-align:center; color:#b8c7db;">
          One-time password
        </p>

        <div style="margin:18px 0 24px; text-align:center;">
          <span style="
            display:inline-block;
            font-size:38px;
            letter-spacing:10px;
            font-weight:700;
            padding:18px 26px;
            border-radius:10px;
            background:#081c35;
            color:#ffffff;
            border:1px solid rgba(255,255,255,0.08);
          ">
            ${otp}
          </span>
        </div>

        <p style="margin:0; font-size:13px; text-align:center; color:#b8c7db;">
          Valid for 5 minutes.
        </p>

        <p style="margin:18px 0 0; font-size:12px; text-align:center; color:#8ea2c0;">
          If you did not request this, you can ignore this email.
        </p>

        <hr style="margin:28px 0; border:none; border-top:1px solid rgba(255,255,255,0.08);">

        <p style="margin:0; font-size:11px; text-align:center; color:#6f86a8;">
          Build Guild Kochi · April 15, 2026 · Kochi, India
        </p>

      </div>
    </div>
  `,
});    if (error) throw new Error(error.message);
    console.log(`✅ OTP email sent to ${userEmail}`);
    return true;
  } catch (err) {
    console.error('❌ OTP email error:', err.message);
    throw err;
  }
};

module.exports = { sendOTPEmail };
