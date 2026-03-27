const QRCode = require('qrcode');

const generateQR = async (token) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(token);
    return qrDataUrl;
  } catch (err) {
    console.error(err);
    throw new Error('QR generation failed');
  }
};

module.exports = { generateQR };
