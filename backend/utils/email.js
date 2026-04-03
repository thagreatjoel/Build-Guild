const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (userEmail, otp) => {
  try {
    console.log(`Attempting to send OTP to: ${userEmail}`);

const { data, error } = await resend.emails.send({
  from: 'joel@thagreatjoel.me',
  to: userEmail,
  subject: 'Your OTP Code for Build Guild Kochi',
  html: `
    <div style="margin:0; padding:0; background:#f5f7fa; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width:480px; margin:40px auto; background:#ffffff; border-radius:12px; padding:32px; box-shadow:0 10px 30px rgba(0,0,0,0.08);">

        <h1 style="margin:0; font-size:20px; font-weight:600; color:#111; text-align:center;">
          Build Guild Kochi
        </h1>

        <p style="margin:24px 0 8px; font-size:14px; color:#555; text-align:center;">
          Your one-time password
        </p>

        <div style="margin:16px 0 24px; text-align:center;">
          <span style="display:inline-block; font-size:36px; letter-spacing:10px; font-weight:600; color:#111; padding:16px 24px; border-radius:8px; background:#f1f3f5;">
            ${otp}
          </span>
        </div>

        <p style="margin:0; font-size:13px; color:#666; text-align:center;">
          This code is valid for 5 minutes.
        </p>

        <p style="margin:20px 0 0; font-size:12px; color:#999; text-align:center;">
          If you did not request this, you can safely ignore this email.
        </p>

        <hr style="margin:28px 0; border:none; border-top:1px solid #eee;">

        <p style="margin:0; font-size:11px; color:#aaa; text-align:center;">
          Build Guild Kochi · April 15, 2026 · Kochi, India
        </p>

      </div>
    </div>
  `,
});
    if (error) throw new Error(error.message);
    console.log(`✅ OTP email sent to ${userEmail}`);
    return true;
  } catch (err) {
    console.error('❌ OTP email error:', err.message);
    throw err;
  }
};

module.exports = { sendOTPEmail };
