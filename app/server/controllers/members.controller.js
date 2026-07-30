const Member = require('../models/Member.model');
const { Membership } = require('../models/MembershipPlan.model');
const Payment = require('../models/Payment.model');
const Attendance = require('../models/Attendance.model');
const ActivityLog = require('../models/ActivityLog.model');
const { generateMemberQR } = require('../services/qr.service');
const { generateMemberCard } = require('../services/pdf.service');
const Settings = require('../models/Settings.model');

const getGymId = (req) => req.user.gymId;

// @route GET /api/members
exports.getMembers = async (req, res) => {
  const gymId = getGymId(req);
  const { page = 1, limit = 20, search, status, planId } = req.query;

  const query = { gymId, isDeleted: false };
  if (status) query.membershipStatus = status;
  if (planId) query.currentPlanId = planId;
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { memberId: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Member.countDocuments(query);
  const members = await Member.find(query)
    .populate('currentPlanId', 'name price durationDays')
    .populate('trainerId', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({
    success: true,
    data: members,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
};

// @route GET /api/members/:id
exports.getMember = async (req, res) => {
  const member = await Member.findOne({ _id: req.params.id, gymId: getGymId(req), isDeleted: false })
    .populate('currentPlanId')
    .populate('trainerId', 'name email phone');

  if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

  const activeMembership = await Membership.findOne({ memberId: member._id, status: 'active' })
    .populate('planId');

  res.json({ success: true, data: { ...member.toObject(), activeMembership } });
};

// @route POST /api/members
exports.createMember = async (req, res) => {
  const gymId = getGymId(req);
  const member = await Member.create({ ...req.body, gymId });

  // Generate QR code
  const qrCode = await generateMemberQR(member._id.toString());
  member.qrCode = qrCode;
  await member.save();

  await ActivityLog.create({
    gymId,
    userId: req.user._id,
    action: 'member.created',
    entity: 'member',
    entityId: member._id,
    description: `Member "${member.fullName}" was added`,
  });

  res.status(201).json({ success: true, data: member });
};

// @route PUT /api/members/:id
exports.updateMember = async (req, res) => {
  const member = await Member.findOneAndUpdate(
    { _id: req.params.id, gymId: getGymId(req) },
    req.body,
    { new: true, runValidators: true }
  );
  if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

  res.json({ success: true, data: member });
};

// @route DELETE /api/members/:id (soft delete)
exports.deleteMember = async (req, res) => {
  const member = await Member.findOneAndUpdate(
    { _id: req.params.id, gymId: getGymId(req) },
    { isDeleted: true },
    { new: true }
  );
  if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

  res.json({ success: true, message: 'Member deleted successfully' });
};

// @route POST /api/members/:id/freeze
exports.freezeMembership = async (req, res) => {
  const membership = await Membership.findOne({ memberId: req.params.id, status: 'active' });
  if (!membership) return res.status(404).json({ success: false, message: 'No active membership found' });

  membership.status = 'frozen';
  membership.freezeStartDate = new Date();
  await membership.save();

  await Member.findByIdAndUpdate(req.params.id, { membershipStatus: 'frozen' });

  res.json({ success: true, message: 'Membership frozen successfully' });
};

// @route POST /api/members/:id/unfreeze
exports.unfreezeMembership = async (req, res) => {
  const membership = await Membership.findOne({ memberId: req.params.id, status: 'frozen' });
  if (!membership) return res.status(404).json({ success: false, message: 'No frozen membership found' });

  const freezeDays = Math.ceil(
    (new Date() - new Date(membership.freezeStartDate)) / (1000 * 60 * 60 * 24)
  );
  membership.totalFreezeDaysUsed += freezeDays;
  membership.endDate = new Date(membership.endDate.getTime() + freezeDays * 24 * 60 * 60 * 1000);
  membership.status = 'active';
  membership.freezeStartDate = null;
  await membership.save();

  await Member.findByIdAndUpdate(req.params.id, { membershipStatus: 'active' });

  res.json({ success: true, message: 'Membership unfrozen. End date extended.', data: membership });
};

// @route GET /api/members/:id/attendance
exports.getMemberAttendance = async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const attendance = await Attendance.find({ memberId: req.params.id })
    .sort({ checkInTime: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, data: attendance });
};

// @route GET /api/members/:id/payments
exports.getMemberPayments = async (req, res) => {
  const payments = await Payment.find({ memberId: req.params.id }).sort({ date: -1 });
  res.json({ success: true, data: payments });
};

// @route GET /api/members/:id/card
exports.downloadMemberCard = async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

  const gym = await Settings.findById(getGymId(req));
  generateMemberCard(res, { member, gym: gym || {} });
};
