const { MembershipPlan, Membership } = require('../models/MembershipPlan.model');
const Member = require('../models/Member.model');

const getGymId = (req) => req.user.gymId;

// GET /api/plans
exports.getPlans = async (req, res) => {
  const plans = await MembershipPlan.find({ gymId: getGymId(req) }).sort({ price: 1 });
  res.json({ success: true, data: plans });
};

// GET /api/plans/active
exports.getActivePlans = async (req, res) => {
  const plans = await MembershipPlan.find({ gymId: getGymId(req), status: 'active' }).sort({ price: 1 });
  res.json({ success: true, data: plans });
};

// GET /api/plans/:id
exports.getPlan = async (req, res) => {
  const plan = await MembershipPlan.findOne({ _id: req.params.id, gymId: getGymId(req) });
  if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
  const memberCount = await Membership.countDocuments({ planId: req.params.id, status: 'active' });
  res.json({ success: true, data: { ...plan.toObject(), activeMembers: memberCount } });
};

// POST /api/plans
exports.createPlan = async (req, res) => {
  const plan = await MembershipPlan.create({ ...req.body, gymId: getGymId(req) });
  res.status(201).json({ success: true, data: plan });
};

// PUT /api/plans/:id
exports.updatePlan = async (req, res) => {
  const plan = await MembershipPlan.findOneAndUpdate(
    { _id: req.params.id, gymId: getGymId(req) },
    req.body,
    { new: true, runValidators: true }
  );
  if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
  res.json({ success: true, data: plan });
};

// DELETE /api/plans/:id
exports.deletePlan = async (req, res) => {
  const activeCount = await Membership.countDocuments({ planId: req.params.id, status: 'active' });
  if (activeCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete — ${activeCount} active members on this plan`,
    });
  }
  await MembershipPlan.findOneAndDelete({ _id: req.params.id, gymId: getGymId(req) });
  res.json({ success: true, message: 'Plan deleted' });
};

// POST /api/plans/assign — Assign plan to member (creates Membership)
exports.assignPlan = async (req, res) => {
  const { memberId, planId, startDate } = req.body;
  const gymId = getGymId(req);

  const plan = await MembershipPlan.findById(planId);
  if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

  const start = new Date(startDate || Date.now());
  const end = new Date(start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

  // Expire any existing active membership
  await Membership.updateMany({ memberId, status: 'active' }, { status: 'expired' });

  const membership = await Membership.create({ gymId, memberId, planId, startDate: start, endDate: end });

  await Member.findByIdAndUpdate(memberId, {
    currentPlanId: planId,
    membershipStatus: 'active',
  });

  res.status(201).json({ success: true, data: membership });
};
