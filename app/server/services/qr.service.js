const QRCode = require('qrcode');

const generateMemberQR = async (memberData) => {
  let qrPayload;
  if (typeof memberData === 'string') {
    qrPayload = JSON.stringify({ memberId: memberData, type: 'gym-checkin' });
  } else if (typeof memberData === 'object' && memberData !== null) {
    qrPayload = JSON.stringify({
      memberId: memberData._id ? memberData._id.toString() : memberData.memberId,
      humanId: memberData.memberId || '',
      fullName: memberData.fullName || '',
      type: 'gym-checkin',
    });
  } else {
    qrPayload = JSON.stringify({ memberId: String(memberData), type: 'gym-checkin' });
  }

  const qrBase64 = await QRCode.toDataURL(qrPayload, {
    width: 350,
    margin: 2,
    color: { dark: '#0f172a', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  });
  return qrBase64;
};

module.exports = { generateMemberQR };

