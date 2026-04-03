const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (userEmail, otp) => {
  try {
    const { data, error } = await resend.emails.send({
  from: 'greatclub@thagreatjoel.me',
  to: userEmail,
  subject: 'Your OTP for Build Guild Kochi',
  html: `
  <div style="margin:0; padding:0; background:#0e305b; font-family:Poppins, Arial, sans-serif;">

    <div style="
      max-width:500px;
      margin:40px auto;
      padding:28px;
      border-radius:12px;
      background-color:#0e305b;
      color:#ffffff;

      /* Static grid */
      background-image:
        linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
      background-size:50px 50px;
    ">

      <h1 style="text-align:center; font-weight:800; letter-spacing:1px;">
        Build Guild <span style="color:#ffc857;">Kochi</span>
      </h1>

      <p style="text-align:center; color:#b8c7db; font-size:14px;">
        One-time password
      </p>

      <div style="text-align:center; margin:20px 0;">
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

      <p style="text-align:center; font-size:13px; color:#b8c7db;">
        Valid for 5 minutes
      </p>

      <hr style="border:none; border-top:1px solid rgba(255,255,255,0.1); margin:24px 0;">

      <p style="text-align:center; font-size:11px; color:#6f86a8;">
        Build Guild Kochi · April 15, 2026 · Kochi, India
      </p>

    </div>
  </div>
  `
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
