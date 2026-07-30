const QRCode = require('qrcode');

const generateMemberQR = async (memberId) => {
  const qrData = JSON.stringify({ memberId, type: 'gym-checkin' });
  const qrBase64 = await QRCode.toDataURL(qrData, {
    width: 300,
    margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });
  return qrBase64;
};

module.exports = { generateMemberQR };
