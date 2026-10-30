const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.model');
const Settings = require('../models/Settings.model');
const sendEmail = require('../services/email.service');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
};

const Organization = require('../models/Organization.model');
const OrganizationMembership = require('../models/OrganizationMembership.model');

// @route  POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Account deactivated. Contact admin.' });
  }

  // Get active memberships across all gyms
  const memberships = await OrganizationMembership.find({ userId: user._id, status: 'active' })
    .populate('organizationId', 'name slug status trialEndsAt currency currencySymbol')
    .lean();

  // If user has memberships and no gymId is set, default to first active gym
  if (!user.gymId && memberships.length > 0 && memberships[0].organizationId) {
    user.gymId = memberships[0].organizationId._id;
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  // Get active gym settings & organization info if applicable
  let gymSettings = null;
  let activeOrganization = null;
  if (user.gymId) {
    [gymSettings, activeOrganization] = await Promise.all([
      Settings.findOne({ $or: [{ _id: user.gymId }, { organizationId: user.gymId }] }).lean(),
      Organization.findById(user.gymId).lean(),
    ]);
  }

  // If member role, attach member profile info
  let memberProfile = null;
  if (user.role === 'member') {
    const Member = require('../models/Member.model');
    const member = await Member.findOne({ userId: user._id, isDeleted: false }).select('_id memberId fullName photo membershipStatus');
    memberProfile = member ? member.toObject() : null;
  }

  res.json({
    success: true,
    accessToken,
    refreshToken,
    user: user.toJSON(),
    gymSettings,
    activeOrganization,
    memberships,
    memberProfile,
  });
};

// @route  POST /api/auth/refresh
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'No refresh token provided' });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token mismatch' });
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
  user.refreshToken = newRefreshToken;
  await user.save();

  res.json({ success: true, accessToken, refreshToken: newRefreshToken });
};

// @route  POST /api/auth/logout
exports.logout = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.refreshToken = null;
    await user.save();
  }
  res.json({ success: true, message: 'Logged out successfully' });
};

// @route  POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always return success to prevent email enumeration
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Fitpulse — Reset Your Password',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto">
          <h2>Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
          <p style="margin-top:16px;color:#888">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return res.status(500).json({ success: false, message: 'Email could not be sent' });
  }

  res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
};

// @route  POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }

  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful. You can now log in.' });
};

// @route  GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  const memberships = await OrganizationMembership.find({ userId: user._id, status: 'active' })
    .populate('organizationId', 'name slug status trialEndsAt currency currencySymbol')
    .lean();

  let gymSettings = null;
  let activeOrganization = null;
  if (user.gymId) {
    [gymSettings, activeOrganization] = await Promise.all([
      Settings.findOne({ $or: [{ _id: user.gymId }, { organizationId: user.gymId }] }).lean(),
      Organization.findById(user.gymId).lean(),
    ]);
  }

  res.json({ success: true, user, gymSettings, activeOrganization, memberships });
};

// @route  POST /api/auth/switch-gym/:orgId
exports.switchGym = async (req, res) => {
  const { orgId } = req.params;

  // Verify membership
  const membership = await OrganizationMembership.findOne({
    userId: req.user._id,
    organizationId: orgId,
    status: 'active',
  }).populate('organizationId');

  if (!membership) {
    return res.status(403).json({ success: false, message: 'You do not have an active membership in this gym' });
  }

  const user = await User.findById(req.user._id);
  user.gymId = orgId;
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  const gymSettings = await Settings.findOne({ $or: [{ _id: orgId }, { organizationId: orgId }] }).lean();

  res.json({
    success: true,
    message: `Switched active gym to ${membership.organizationId.name}`,
    accessToken,
    refreshToken,
    activeGym: membership.organizationId,
    activeRole: membership.role,
    gymSettings,
  });
};

// @route  POST /api/auth/impersonate/:orgId (Super Admin Support Impersonation)
exports.impersonateGym = async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Only Super Admin can initiate gym support impersonation' });
  }

  const { orgId } = req.params;
  const { reason } = req.body;

  const org = await Organization.findOne({ _id: orgId, isDeleted: false });
  if (!org) {
    return res.status(404).json({ success: false, message: 'Gym not found' });
  }

  // Audit log support impersonation
  const ActivityLog = require('../models/ActivityLog.model');
  await ActivityLog.create({
    gymId: org._id,
    userId: req.user._id,
    action: 'superadmin.support_impersonation',
    description: `Super Admin "${req.user.name}" started support session for gym "${org.name}". Reason: ${reason || 'Technical Support'}`,
    metadata: { superAdminEmail: req.user.email, targetGymId: org._id, reason },
  });

  const supportToken = jwt.sign(
    { id: req.user._id, gymContext: org._id, isImpersonating: true },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({
    success: true,
    message: `Support impersonation active for "${org.name}" (1 hour duration)`,
    supportToken,
    targetGym: org,
  });
};
