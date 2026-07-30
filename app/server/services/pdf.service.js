const PDFDocument = require('pdfkit');

/**
 * Generate a payment receipt PDF and pipe it to a response stream
 */
const generateReceipt = (res, { payment, member, gym }) => {
  const doc = new PDFDocument({ size: 'A5', margin: 40 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="receipt-${payment.invoiceNumber}.pdf"`
  );
  doc.pipe(res);

  const primaryColor = '#6366f1';
  const darkBg = '#0f0f1a';
  const textGray = '#888';

  // Header background
  doc.rect(0, 0, doc.page.width, 100).fill(darkBg);

  // Gym name
  doc
    .fillColor(primaryColor)
    .fontSize(22)
    .font('Helvetica-Bold')
    .text(gym.gymName || 'Fitpulse Gym', 40, 30);

  doc
    .fillColor('#ffffff')
    .fontSize(10)
    .font('Helvetica')
    .text(gym.address || '', 40, 58)
    .text(`GST: ${gym.gstNumber || 'N/A'}  |  ${gym.phone || ''}`, 40, 72);

  // Invoice title
  doc
    .fillColor(darkBg)
    .fontSize(14)
    .font('Helvetica-Bold')
    .fillColor('#1a1a2e')
    .text('PAYMENT RECEIPT', 40, 120);

  doc
    .fillColor(textGray)
    .fontSize(10)
    .font('Helvetica')
    .text(`Invoice: ${payment.invoiceNumber}`, 40, 142)
    .text(`Date: ${new Date(payment.date).toLocaleDateString('en-IN')}`, 40, 157);

  // Divider
  doc.moveTo(40, 180).lineTo(doc.page.width - 40, 180).strokeColor('#e5e7eb').stroke();

  // Member info
  doc.fillColor('#111').fontSize(11).font('Helvetica-Bold').text('Member Details', 40, 195);
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#333')
    .text(`Name: ${member.fullName}`, 40, 213)
    .text(`ID: ${member.memberId}`, 40, 228)
    .text(`Phone: ${member.phone}`, 40, 243);

  // Divider
  doc.moveTo(40, 265).lineTo(doc.page.width - 40, 265).strokeColor('#e5e7eb').stroke();

  // Payment info
  doc.fillColor('#111').fontSize(11).font('Helvetica-Bold').text('Payment Details', 40, 280);

  const items = [
    ['Amount', `${gym.currencySymbol || '₹'}${payment.amount.toFixed(2)}`],
    ['Paid', `${gym.currencySymbol || '₹'}${payment.paidAmount.toFixed(2)}`],
    ['Due', `${gym.currencySymbol || '₹'}${(payment.dueAmount || 0).toFixed(2)}`],
    ['Method', payment.method.toUpperCase()],
    ['Status', payment.status.toUpperCase()],
  ];

  if (payment.gstAmount > 0) {
    items.splice(2, 0, ['GST', `${gym.currencySymbol || '₹'}${payment.gstAmount.toFixed(2)}`]);
  }

  let y = 298;
  items.forEach(([label, value]) => {
    doc
      .font('Helvetica')
      .fillColor(textGray)
      .text(label, 40, y)
      .fillColor('#111')
      .text(value, 200, y);
    y += 18;
  });

  // Footer
  doc.moveTo(40, y + 15).lineTo(doc.page.width - 40, y + 15).strokeColor('#e5e7eb').stroke();
  doc
    .fillColor(textGray)
    .fontSize(9)
    .text(gym.receiptFooter || 'Thank you for choosing us!', 40, y + 25, { align: 'center' });

  doc.end();
};

/**
 * Generate a member card PDF
 */
const generateMemberCard = (res, { member, gym }) => {
  const doc = new PDFDocument({ size: [340, 200], margin: 20 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="card-${member.memberId}.pdf"`);
  doc.pipe(res);

  // Background
  doc.rect(0, 0, 340, 200).fill('#0f0f1a');

  // Accent stripe
  doc.rect(0, 0, 8, 200).fill('#6366f1');

  // Gym name
  doc.fillColor('#6366f1').fontSize(13).font('Helvetica-Bold').text(gym.gymName, 20, 18);

  // Member name
  doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text(member.fullName, 20, 50);

  // Member ID & phone
  doc
    .fillColor('#aaa')
    .fontSize(9)
    .font('Helvetica')
    .text(`ID: ${member.memberId}`, 20, 80)
    .text(`Phone: ${member.phone}`, 20, 95)
    .text(`Status: ${member.membershipStatus.toUpperCase()}`, 20, 110);

  // QR code (if available)
  if (member.qrCode) {
    const base64Data = member.qrCode.split(',')[1];
    const imgBuffer = Buffer.from(base64Data, 'base64');
    doc.image(imgBuffer, 250, 30, { width: 70 });
  }

  doc.end();
};

module.exports = { generateReceipt, generateMemberCard };
