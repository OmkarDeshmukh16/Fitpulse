const Payment = require('../models/Payment.model');
const Member = require('../models/Member.model');
const Settings = require('../models/Settings.model');
const { generateReceipt } = require('../services/pdf.service');

const getGymId = (req) => req.user.gymId;

// GET /api/payments
exports.getPayments = async (req, res) => {
  const gymId = getGymId(req);
  const { page = 1, limit = 20, status, memberId, startDate, endDate, method, range } = req.query;

  const query = { gymId };
  if (status) {
    query.status = status;
  }
  if (memberId) query.memberId = memberId;
  if (method) query.method = method;

  if (range === 'today') {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    query.date = { $gte: startOfDay, $lte: endOfDay };
    if (!status) query.status = { $in: ['paid', 'partial'] };
  } else if (range === 'month') {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    query.date = { $gte: startOfMonth, $lte: endOfMonth };
    if (!status) query.status = { $in: ['paid', 'partial'] };
  } else if (startDate && endDate) {
    query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const total = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .populate('memberId', 'fullName memberId phone')
    .populate('createdBy', 'name')
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({
    success: true,
    data: payments,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
};

// GET /api/payments/:id
exports.getPayment = async (req, res) => {
  const payment = await Payment.findOne({ _id: req.params.id, gymId: getGymId(req) })
    .populate('memberId', 'fullName memberId phone address')
    .populate('membershipId')
    .populate('createdBy', 'name');

  if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
  res.json({ success: true, data: payment });
};

// POST /api/payments
exports.createPayment = async (req, res) => {
  const gymId = getGymId(req);
  const { memberId, amount, paidAmount, method, date, transactionId, gstPercent, notes, membershipId } = req.body;

  const member = await Member.findOne({ _id: memberId, gymId });
  if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

  const paid = parseFloat(paidAmount || amount);
  const gstAmt = gstPercent ? parseFloat(((amount * gstPercent) / 100).toFixed(2)) : 0;

  const payment = await Payment.create({
    gymId,
    memberId,
    membershipId: membershipId || null,
    amount: parseFloat(amount),
    paidAmount: paid,
    dueAmount: parseFloat(amount) - paid,
    method,
    date: date ? new Date(date) : new Date(),
    transactionId: transactionId || '',
    gstAmount: gstAmt,
    gstPercent: gstPercent || 0,
    status: paid >= parseFloat(amount) ? 'paid' : paid > 0 ? 'partial' : 'pending',
    notes: notes || '',
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: payment });
};

// PUT /api/payments/:id
exports.updatePayment = async (req, res) => {
  const payment = await Payment.findOneAndUpdate(
    { _id: req.params.id, gymId: getGymId(req) },
    req.body,
    { new: true }
  );
  if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
  res.json({ success: true, data: payment });
};

// POST /api/payments/:id/refund
exports.refundPayment = async (req, res) => {
  const payment = await Payment.findOne({ _id: req.params.id, gymId: getGymId(req) });
  if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

  const { refundAmount, refundReason } = req.body;
  payment.isRefunded = true;
  payment.refundAmount = parseFloat(refundAmount || payment.paidAmount);
  payment.refundDate = new Date();
  payment.refundReason = refundReason || '';
  payment.status = 'refunded';
  await payment.save();

  res.json({ success: true, data: payment, message: 'Payment refunded successfully' });
};

// GET /api/payments/:id/receipt
exports.downloadReceipt = async (req, res) => {
  const payment = await Payment.findOne({ _id: req.params.id, gymId: getGymId(req) }).populate('memberId');
  if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

  const gym = await Settings.findById(getGymId(req));
  generateReceipt(res, { payment, member: payment.memberId, gym: gym || {} });
};
