// mailer.js

const nodemailer = require("nodemailer");
const { google } = require("googleapis");

// OAuth2 setup
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

// Set refresh token
oAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const sendOTPEmail = async (userEmail, otp) => {
  try {
    // Get access token
    const accessToken = await oAuth2Client.getAccessToken();

    // Create transporter using Gmail API (OAuth2)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "kochi@blueprint.hackclub.com",
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    // Send email
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

          <h1 style="text-align:center;">
            Build Guild <span style="color:#ffc857;">Kochi</span>
          </h1>

          <p style="text-align:center; color:#b8c7db;">
            Your OTP Code
          </p>

          <div style="text-align:center; margin:20px 0;">
            <span style="
              font-size:36px;
              letter-spacing:10px;
              font-weight:bold;
              padding:15px 25px;
              background:#081c35;
              border-radius:8px;
            ">
              ${otp}
            </span>
          </div>

          <p style="text-align:center; font-size:13px;">
            Valid for 5 minutes
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