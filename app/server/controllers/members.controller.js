const Member = require('../models/Member.model');
const { Membership, MembershipPlan } = require('../models/MembershipPlan.model');
const User = require('../models/User.model');
const Payment = require('../models/Payment.model');
const Attendance = require('../models/Attendance.model');
const ActivityLog = require('../models/ActivityLog.model');
const { generateMemberQR } = require('../services/qr.service');
const { generateMemberCard } = require('../services/pdf.service');
const Settings = require('../models/Settings.model');

const getGymId = (req) => req.user.gymId;

// Helper: get member IDs whose membership has expired based on Membership records
async function getExpiredMemberIds(gymId) {
  const now = new Date();
  const activeMemberIds = await Membership.distinct('memberId', {
    gymId,
    status: { $in: ['active', 'frozen'] },
    endDate: { $gte: now },
  });

  const expiredMemberIds = await Membership.distinct('memberId', {
    gymId,
    $or: [{ endDate: { $lt: now } }, { status: 'expired' }],
    memberId: { $nin: activeMemberIds },
  });

  return expiredMemberIds;
}

// @route GET /api/members
exports.getMembers = async (req, res) => {
  const gymId = getGymId(req);
  const { page = 1, limit = 20, search, status, filter, planId } = req.query;

  const query = { gymId, isDeleted: false };
  const andConditions = [];

  const expiredMemberIds = await getExpiredMemberIds(gymId);

  if (status) {
    if (status === 'inactive') {
      andConditions.push({
        $or: [
          { membershipStatus: { $in: ['inactive', 'expired'] } },
          { _id: { $in: expiredMemberIds } },
        ],
      });
    } else if (status === 'expired') {
      andConditions.push({
        $or: [
          { membershipStatus: 'expired' },
          { _id: { $in: expiredMemberIds } },
        ],
      });
    } else if (status === 'active') {
      query.membershipStatus = 'active';
      if (expiredMemberIds.length > 0) {
        query._id = { $nin: expiredMemberIds };
      }
    } else if (status === 'newThisMonth' || status === 'new') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      query.createdAt = { $gte: startOfMonth, $lte: endOfMonth };
    } else {
      query.membershipStatus = status;
    }
  }

  if (filter === 'newThisMonth' || filter === 'new') {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    query.createdAt = { $gte: startOfMonth, $lte: endOfMonth };
  }

  if (planId) query.currentPlanId = planId;
  if (search) {
    andConditions.push({
      $or: [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { memberId: { $regex: search, $options: 'i' } },
      ],
    });
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  const total = await Member.countDocuments(query);
  const members = await Member.find(query)
    .populate('currentPlanId', 'name price durationDays')
    .populate('trainerId', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const expiredSet = new Set(expiredMemberIds.map((id) => id.toString()));
  const formattedMembers = members.map((m) => {
    const obj = m.toObject();
    if (expiredSet.has(obj._id.toString())) {
      obj.membershipStatus = 'expired';
    }
    return obj;
  });

  res.json({
    success: true,
    data: formattedMembers,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
};

// @route GET /api/members/:id
exports.getMember = async (req, res) => {
  const member = await Member.findOne({ _id: req.params.id, gymId: getGymId(req), isDeleted: false })
    .populate('currentPlanId')
    .populate('trainerId', 'name email phone');

  if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

  if (!member.qrCode) {
    try {
      member.qrCode = await generateMemberQR(member);
      await member.save();
    } catch {}
  }

  const activeMembership = await Membership.findOne({ memberId: member._id, status: 'active' })
    .populate('planId');

  const memberObj = member.toObject();
  if (memberObj.membershipStatus === 'active') {
    const now = new Date();
    if (activeMembership && activeMembership.endDate && new Date(activeMembership.endDate) < now) {
      memberObj.membershipStatus = 'expired';
    } else if (!activeMembership) {
      const latest = await Membership.findOne({ memberId: member._id }).sort({ endDate: -1 });
      if (latest && latest.endDate && new Date(latest.endDate) < now) {
        memberObj.membershipStatus = 'expired';
      }
    }
  }

  res.json({ success: true, data: { ...memberObj, activeMembership } });
};

// @route POST /api/members
exports.createMember = async (req, res) => {
  const gymId = getGymId(req);
  const { planId, currentPlanId, password, ...memberData } = req.body;
  const selectedPlanId = planId || currentPlanId;

  const member = await Member.create({
    ...memberData,
    gymId,
    currentPlanId: selectedPlanId || null,
    membershipStatus: selectedPlanId ? 'active' : (memberData.membershipStatus || 'active'),
  });

  // If plan was selected, create active Membership record
  if (selectedPlanId) {
    const plan = await MembershipPlan.findById(selectedPlanId);
    if (plan) {
      const start = new Date();
      const end = new Date(start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
      await Membership.create({
        gymId,
        memberId: member._id,
        planId: selectedPlanId,
        startDate: start,
        endDate: end,
        status: 'active',
      });
    }
  }

  // Handle password / User account creation
  if (password && password.trim()) {
    const userEmail = member.email || `${member.memberId.toLowerCase()}@fitpulse.app`;
    let user = await User.findOne({ email: userEmail });
    if (!user) {
      user = await User.create({
        gymId,
        name: member.fullName,
        email: userEmail,
        password: password.trim(),
        role: 'member',
      });
    } else {
      user.password = password.trim();
      await user.save();
    }
    member.userId = user._id;
  }

  // Generate QR code
  const qrCode = await generateMemberQR(member);
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
