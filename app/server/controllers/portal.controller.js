const Member = require('../models/Member.model');
const { MembershipPlan, Membership } = require('../models/MembershipPlan.model');
const Attendance = require('../models/Attendance.model');
const Payment = require('../models/Payment.model');
const WorkoutPlan = require('../models/WorkoutPlan.model');
const DietPlan = require('../models/DietPlan.model');
const PTSession = require('../models/PTSession.model');
const Progress = require('../models/Progress.model');
const User = require('../models/User.model');
const Settings = require('../models/Settings.model');
const { generateReceipt } = require('../services/pdf.service');
const { generateMemberQR } = require('../services/qr.service');
const razorpayService = require('../services/razorpay.service');

// Helper: get the Member document for the logged-in member user
const getMember = async (req) => {
  const member = await Member.findOne({ userId: req.user._id, isDeleted: false });
  if (!member) throw Object.assign(new Error('Member profile not found'), { statusCode: 404 });
  return member;
};

// ─────────────────────────────────────────────
// GET /api/portal/dashboard
// ─────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  const member = await getMember(req);
  const gymId = member.gymId;

  // Auto-generate QR code if missing
  if (!member.qrCode) {
    try {
      member.qrCode = await generateMemberQR(member);
      await member.save();
    } catch {}
  }

  // Current membership
  const membership = await Membership.findOne({
    memberId: member._id,
    gymId,
    status: 'active',
  }).populate('planId').sort({ endDate: -1 });

  const daysRemaining = membership
    ? Math.max(0, Math.ceil((new Date(membership.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Attendance this month
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-31`;

  const attendanceThisMonth = await Attendance.countDocuments({
    memberId: member._id,
    gymId,
    date: { $gte: monthStart, $lte: monthEnd },
  });

  // Attendance streak (consecutive days)
  const recentAttendance = await Attendance.find({
    memberId: member._id,
    gymId,
  }).sort({ date: -1 }).limit(60).select('date');

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const attendanceDates = [...new Set(recentAttendance.map((a) => a.date))];

  for (let i = 0; i < 60; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    if (attendanceDates.includes(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  // Upcoming PT sessions
  const upcomingPT = await PTSession.find({
    memberId: member._id,
    gymId,
    date: { $gte: new Date() },
    status: 'scheduled',
  }).populate('trainerId', 'name').sort({ date: 1 }).limit(3);

  // Last 30 days attendance for mini calendar
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30 = await Attendance.find({
    memberId: member._id,
    gymId,
    date: { $gte: thirtyDaysAgo.toISOString().split('T')[0] },
  }).select('date checkInTime');

  res.json({
    success: true,
    data: {
      member: {
        _id: member._id,
        fullName: member.fullName,
        memberId: member.memberId,
        photo: member.photo,
        email: member.email,
        phone: member.phone,
        qrCode: member.qrCode,
        membershipStatus: member.membershipStatus,
      },
      membership: membership ? {
        planName: membership.planId?.name,
        startDate: membership.startDate,
        endDate: membership.endDate,
        status: membership.status,
        daysRemaining,
      } : null,
      stats: {
        daysRemaining,
        attendanceThisMonth,
        streak,
        upcomingPTCount: upcomingPT.length,
      },
      upcomingPT,
      last30Attendance: last30.map((a) => a.date),
    },
  });
};

// ─────────────────────────────────────────────
// GET /api/portal/membership
// ─────────────────────────────────────────────
exports.getMembership = async (req, res) => {
  const member = await getMember(req);

  const memberships = await Membership.find({
    memberId: member._id,
    gymId: member.gymId,
  }).populate('planId').sort({ endDate: -1 });

  // Available plans for renewal
  const availablePlans = await MembershipPlan.find({
    gymId: member.gymId,
    status: 'active',
  }).sort({ price: 1 });

  res.json({
    success: true,
    data: {
      current: memberships.find((m) => m.status === 'active') || null,
      history: memberships,
      availablePlans,
      membershipStatus: member.membershipStatus,
    },
  });
};

// ─────────────────────────────────────────────
// GET /api/portal/attendance
// ─────────────────────────────────────────────
exports.getAttendance = async (req, res) => {
  const member = await getMember(req);
  const { page = 1, limit = 30, month } = req.query;

  const query = { memberId: member._id, gymId: member.gymId };

  if (month) {
    // month format: "2026-08"
    const [year, m] = month.split('-');
    const startDate = `${year}-${m}-01`;
    const endDate = `${year}-${m}-31`;
    query.date = { $gte: startDate, $lte: endDate };
  }

  const total = await Attendance.countDocuments(query);
  const records = await Attendance.find(query)
    .sort({ date: -1, checkInTime: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  // Monthly summary
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthCount = await Attendance.countDocuments({
    ...query,
    date: { $gte: `${thisMonth}-01`, $lte: `${thisMonth}-31` },
  });

  const totalDays = await Attendance.distinct('date', { memberId: member._id, gymId: member.gymId });

  res.json({
    success: true,
    data: records,
    summary: {
      totalDays: totalDays.length,
      thisMonth: thisMonthCount,
    },
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
};

// ─────────────────────────────────────────────
// GET /api/portal/workout-plan
// ─────────────────────────────────────────────
exports.getWorkoutPlan = async (req, res) => {
  const member = await getMember(req);

  const plan = await WorkoutPlan.findOne({
    memberId: member._id,
    gymId: member.gymId,
    isActive: true,
  }).populate('trainerId', 'name avatar');

  res.json({ success: true, data: plan });
};

// ─────────────────────────────────────────────
// GET /api/portal/diet-plan
// ─────────────────────────────────────────────
exports.getDietPlan = async (req, res) => {
  const member = await getMember(req);

  const plan = await DietPlan.findOne({
    memberId: member._id,
    gymId: member.gymId,
    isActive: true,
  }).populate('trainerId', 'name avatar');

  res.json({ success: true, data: plan });
};

// ─────────────────────────────────────────────
// GET /api/portal/progress
// ─────────────────────────────────────────────
exports.getProgress = async (req, res) => {
  const member = await getMember(req);

  const entries = await Progress.find({
    memberId: member._id,
    gymId: member.gymId,
  }).sort({ date: -1 }).limit(50);

  res.json({ success: true, data: entries });
};

// ─────────────────────────────────────────────
// POST /api/portal/progress
// ─────────────────────────────────────────────
exports.addProgress = async (req, res) => {
  const member = await getMember(req);
  const { weight, bodyFat, chest, waist, hips, biceps, thighs, notes } = req.body;

  const entry = await Progress.create({
    gymId: member.gymId,
    memberId: member._id,
    weight: weight || null,
    bodyFat: bodyFat || null,
    chest: chest || null,
    waist: waist || null,
    hips: hips || null,
    biceps: biceps || null,
    thighs: thighs || null,
    notes: notes || '',
  });

  res.status(201).json({ success: true, data: entry });
};

// ─────────────────────────────────────────────
// GET /api/portal/pt-sessions
// ─────────────────────────────────────────────
exports.getPTSessions = async (req, res) => {
  const member = await getMember(req);
  const { status } = req.query;

  const query = { memberId: member._id, gymId: member.gymId };
  if (status) query.status = status;

  const sessions = await PTSession.find(query)
    .populate('trainerId', 'name avatar')
    .sort({ date: -1 });

  // Available trainers for booking
  const trainers = await User.find({
    gymId: member.gymId,
    role: 'trainer',
    isActive: true,
  }).select('name avatar');

  res.json({ success: true, data: sessions, trainers });
};

// ─────────────────────────────────────────────
// POST /api/portal/pt-sessions
// ─────────────────────────────────────────────
exports.bookPTSession = async (req, res) => {
  const member = await getMember(req);
  const { trainerId, date, startTime, endTime, sessionType, notes } = req.body;

  if (!trainerId || !date || !startTime || !endTime) {
    return res.status(400).json({ success: false, message: 'Trainer, date, and time are required' });
  }

  // Check for conflicting session
  const conflict = await PTSession.findOne({
    trainerId,
    date: new Date(date),
    startTime,
    status: 'scheduled',
  });

  if (conflict) {
    return res.status(409).json({ success: false, message: 'This time slot is already booked' });
  }

  const session = await PTSession.create({
    gymId: member.gymId,
    memberId: member._id,
    trainerId,
    date: new Date(date),
    startTime,
    endTime,
    sessionType: sessionType || 'mixed',
    notes: notes || '',
  });

  const populated = await PTSession.findById(session._id).populate('trainerId', 'name avatar');

  res.status(201).json({ success: true, data: populated });
};

// ─────────────────────────────────────────────
// PUT /api/portal/pt-sessions/:id/cancel
// ─────────────────────────────────────────────
exports.cancelPTSession = async (req, res) => {
  const member = await getMember(req);

  const session = await PTSession.findOne({
    _id: req.params.id,
    memberId: member._id,
    gymId: member.gymId,
    status: 'scheduled',
  });

  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found or already cancelled' });
  }

  session.status = 'cancelled';
  session.cancelReason = req.body.reason || 'Cancelled by member';
  await session.save();

  res.json({ success: true, data: session, message: 'Session cancelled successfully' });
};

// ─────────────────────────────────────────────
// GET /api/portal/payments
// ─────────────────────────────────────────────
exports.getPayments = async (req, res) => {
  const member = await getMember(req);
  const { page = 1, limit = 20 } = req.query;

  const query = { memberId: member._id, gymId: member.gymId };
  const total = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({
    success: true,
    data: payments,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
};

// ─────────────────────────────────────────────
// GET /api/portal/payments/:id/receipt
// ─────────────────────────────────────────────
exports.downloadReceipt = async (req, res) => {
  const member = await getMember(req);

  const payment = await Payment.findOne({
    _id: req.params.id,
    memberId: member._id,
    gymId: member.gymId,
  });

  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment not found' });
  }

  const gym = await Settings.findById(member.gymId);
  generateReceipt(res, { payment, member, gym: gym || {} });
};

// ─────────────────────────────────────────────
// POST /api/portal/renew/create-order
// ─────────────────────────────────────────────
exports.createRenewalOrder = async (req, res) => {
  const member = await getMember(req);
  const { planId } = req.body;

  if (!planId) {
    return res.status(400).json({ success: false, message: 'Plan ID is required' });
  }

  const plan = await MembershipPlan.findOne({ _id: planId, gymId: member.gymId, status: 'active' });
  if (!plan) {
    return res.status(404).json({ success: false, message: 'Plan not found' });
  }

  // Amount in paise (INR smallest unit)
  const amountInPaise = Math.round(plan.price * 100);
  const receipt = `renew_${member.memberId}_${Date.now()}`;

  const order = await razorpayService.createOrder(amountInPaise, 'INR', receipt, {
    memberId: member._id.toString(),
    planId: plan._id.toString(),
    memberName: member.fullName,
  });

  res.json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayService.getKeyId(),
      plan: {
        name: plan.name,
        price: plan.price,
        durationDays: plan.durationDays,
      },
      member: {
        fullName: member.fullName,
        email: member.email,
        phone: member.phone,
      },
    },
  });
};

// ─────────────────────────────────────────────
// POST /api/portal/renew/verify
// ─────────────────────────────────────────────
exports.verifyRenewalPayment = async (req, res) => {
  const member = await getMember(req);
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
    return res.status(400).json({ success: false, message: 'Missing payment verification data' });
  }

  // Verify signature
  const isValid = razorpayService.verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
  }

  // Get plan
  const plan = await MembershipPlan.findById(planId);
  if (!plan) {
    return res.status(404).json({ success: false, message: 'Plan not found' });
  }

  // Determine start date — if member has active membership, start after it ends
  const activeMembership = await Membership.findOne({
    memberId: member._id,
    gymId: member.gymId,
    status: 'active',
  });

  const startDate = activeMembership && new Date(activeMembership.endDate) > new Date()
    ? new Date(activeMembership.endDate)
    : new Date();

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + plan.durationDays);

  // Create new membership
  const newMembership = await Membership.create({
    gymId: member.gymId,
    memberId: member._id,
    planId: plan._id,
    startDate,
    endDate,
    status: 'active',
    renewedFrom: activeMembership?._id || null,
  });

  // If previous was active, mark it expired
  if (activeMembership) {
    activeMembership.status = 'expired';
    await activeMembership.save();
  }

  // Create payment record
  const payment = await Payment.create({
    gymId: member.gymId,
    memberId: member._id,
    membershipId: newMembership._id,
    amount: plan.price,
    paidAmount: plan.price,
    dueAmount: 0,
    method: 'upi', // Razorpay handles multiple methods, we mark as UPI/online
    status: 'paid',
    transactionId: razorpay_payment_id,
    notes: `Online renewal via Razorpay. Order: ${razorpay_order_id}`,
    createdBy: req.user._id,
  });

  // Update member status
  member.membershipStatus = 'active';
  member.currentPlanId = plan._id;
  await member.save();

  res.json({
    success: true,
    message: 'Membership renewed successfully!',
    data: {
      membership: newMembership,
      payment,
    },
  });
};

// ─────────────────────────────────────────────
// GET /api/portal/profile
// ─────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  const member = await getMember(req);
  const gymId = member.gymId;

  // Auto-generate QR code if missing
  if (!member.qrCode) {
    try {
      member.qrCode = await generateMemberQR(member);
      await member.save();
    } catch {}
  }

  const populatedMember = await Member.findById(member._id)
    .populate('currentPlanId')
    .populate('trainerId', 'name email phone');

  const activeMembership = await Membership.findOne({
    memberId: member._id,
    gymId,
    status: 'active',
  }).populate('planId');

  const gym = await Settings.findById(gymId);

  res.json({
    success: true,
    data: {
      ...populatedMember.toObject(),
      activeMembership,
      gym: gym ? { name: gym.gymName, phone: gym.phone, email: gym.email, address: gym.address } : null,
    },
  });
};

// ─────────────────────────────────────────────
// PUT /api/portal/profile
// ─────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  const member = await getMember(req);
  const { phone, email, address, emergencyContact, medicalConditions } = req.body;

  if (phone) member.phone = phone;
  if (email) member.email = email;
  if (address !== undefined) member.address = address;
  if (emergencyContact) member.emergencyContact = emergencyContact;
  if (medicalConditions !== undefined) member.medicalConditions = medicalConditions;

  await member.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: member,
  });
};

