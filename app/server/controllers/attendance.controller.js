const mongoose = require('mongoose');
const Attendance = require('../models/Attendance.model');
const Member = require('../models/Member.model');

const getGymId = (req) => req.user.gymId;

const getTodayString = () => new Date().toISOString().split('T')[0];

// Helper: flexibly find member by Mongo _id, custom memberId, phone, or email
async function findMemberByIdentifier(gymId, identifier) {
  if (!identifier) return null;
  const trimmed = String(identifier).trim();

  // 1. Try as MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(trimmed) && trimmed.length === 24) {
    const member = await Member.findOne({ _id: trimmed, gymId, isDeleted: false })
      .populate('currentPlanId', 'name price durationDays');
    if (member) return member;
  }

  // 2. Try as exact or case-insensitive memberId string (e.g. FP-174023...)
  const escaped = trimmed.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  let member = await Member.findOne({
    gymId,
    isDeleted: false,
    memberId: { $regex: `^${escaped}$`, $options: 'i' },
  }).populate('currentPlanId', 'name price durationDays');
  if (member) return member;

  // 3. Try as phone number
  member = await Member.findOne({
    gymId,
    isDeleted: false,
    phone: trimmed,
  }).populate('currentPlanId', 'name price durationDays');
  if (member) return member;

  // 4. Try as email
  member = await Member.findOne({
    gymId,
    isDeleted: false,
    email: trimmed.toLowerCase(),
  }).populate('currentPlanId', 'name price durationDays');
  if (member) return member;

  // 5. Try partial match on memberId or full name if not found
  member = await Member.findOne({
    gymId,
    isDeleted: false,
    $or: [
      { memberId: { $regex: escaped, $options: 'i' } },
      { fullName: { $regex: `^${escaped}$`, $options: 'i' } },
    ],
  }).populate('currentPlanId', 'name price durationDays');

  return member;
}

// POST /api/attendance/checkin
exports.checkIn = async (req, res) => {
  const gymId = getGymId(req);
  const { memberId, method = 'manual' } = req.body;

  if (!memberId) {
    return res.status(400).json({ success: false, message: 'Member ID is required' });
  }

  const member = await findMemberByIdentifier(gymId, memberId);
  if (!member) {
    return res.status(404).json({
      success: false,
      message: `Member not found with ID "${memberId}". Please check Member ID or Phone.`,
    });
  }

  const today = getTodayString();

  // Check if already checked in today (and not yet checked out)
  const existing = await Attendance.findOne({
    gymId,
    memberId: member._id,
    date: today,
    checkOutTime: null,
  });

  if (existing) {
    const timeStr = existing.checkInTime ? new Date(existing.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
    return res.status(400).json({
      success: false,
      message: `${member.fullName} is already checked in today (${timeStr})`,
      alreadyCheckedIn: true,
      data: existing,
      member: {
        _id: member._id,
        fullName: member.fullName,
        memberId: member.memberId,
        photo: member.photo,
        phone: member.phone,
        membershipStatus: member.membershipStatus,
        planName: member.currentPlanId?.name || null,
      },
    });
  }

  const attendance = await Attendance.create({
    gymId,
    memberId: member._id,
    date: today,
    checkInTime: new Date(),
    method,
    trainerId: member.trainerId || null,
  });

  res.status(201).json({
    success: true,
    action: 'checkin',
    message: `✅ ${member.fullName} checked in successfully!`,
    data: attendance,
    member: {
      _id: member._id,
      fullName: member.fullName,
      memberId: member.memberId,
      photo: member.photo,
      phone: member.phone,
      membershipStatus: member.membershipStatus,
      planName: member.currentPlanId?.name || null,
    },
  });
};

// POST /api/attendance/checkout
exports.checkOut = async (req, res) => {
  const gymId = getGymId(req);
  const { memberId } = req.body;

  if (!memberId) {
    return res.status(400).json({ success: false, message: 'Member ID is required' });
  }

  const member = await findMemberByIdentifier(gymId, memberId);
  if (!member) {
    return res.status(404).json({ success: false, message: 'Member not found' });
  }

  const today = getTodayString();
  const attendance = await Attendance.findOne({
    gymId,
    memberId: member._id,
    date: today,
    checkOutTime: null,
  });

  if (!attendance) {
    return res.status(404).json({
      success: false,
      message: `No active check-in found for ${member.fullName} today`,
    });
  }

  attendance.checkOutTime = new Date();
  attendance.duration = Math.max(
    1,
    Math.round((attendance.checkOutTime - attendance.checkInTime) / (1000 * 60))
  );
  await attendance.save();

  res.json({
    success: true,
    action: 'checkout',
    message: `👋 ${member.fullName} checked out (${attendance.duration} min workout)`,
    data: attendance,
    member: {
      _id: member._id,
      fullName: member.fullName,
      memberId: member.memberId,
      photo: member.photo,
      phone: member.phone,
      membershipStatus: member.membershipStatus,
      planName: member.currentPlanId?.name || null,
    },
  });
};

// POST /api/attendance/checkin-qr
// Smart QR Endpoint: supports check-in, check-out, and auto-toggle
exports.checkInByQR = async (req, res) => {
  const gymId = getGymId(req);
  const { qrData, mode = 'auto' } = req.body; // mode: 'auto' | 'checkin' | 'checkout'

  if (!qrData) {
    return res.status(400).json({ success: false, message: 'QR data is required' });
  }

  let candidateId = String(qrData).trim();

  // Try parsing JSON payload if QR contains encoded object
  if (candidateId.startsWith('{') && candidateId.endsWith('}')) {
    try {
      const parsed = JSON.parse(candidateId);
      candidateId = parsed.memberId || parsed.humanId || parsed.id || parsed.code || candidateId;
    } catch {
      // ignore json parse error and treat as raw string
    }
  }

  const member = await findMemberByIdentifier(gymId, candidateId);
  if (!member) {
    return res.status(404).json({
      success: false,
      message: `No gym member found matching QR Code ("${candidateId.slice(0, 30)}")`,
    });
  }

  const today = getTodayString();
  const existingActive = await Attendance.findOne({
    gymId,
    memberId: member._id,
    date: today,
    checkOutTime: null,
  });

  // Handle explicit checkout mode or auto toggle when already in gym
  if (mode === 'checkout' || (mode === 'auto' && existingActive)) {
    if (!existingActive) {
      return res.status(404).json({
        success: false,
        message: `No active check-in found today for ${member.fullName}`,
      });
    }

    existingActive.checkOutTime = new Date();
    existingActive.duration = Math.max(
      1,
      Math.round((existingActive.checkOutTime - existingActive.checkInTime) / (1000 * 60))
    );
    await existingActive.save();

    return res.json({
      success: true,
      action: 'checkout',
      message: `👋 Checked out: ${member.fullName} (${existingActive.duration} min)`,
      data: existingActive,
      member: {
        _id: member._id,
        fullName: member.fullName,
        memberId: member.memberId,
        photo: member.photo,
        phone: member.phone,
        membershipStatus: member.membershipStatus,
        planName: member.currentPlanId?.name || null,
      },
    });
  }

  // Handle check-in mode
  if (existingActive) {
    const timeStr = existingActive.checkInTime
      ? new Date(existingActive.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : '';
    return res.status(400).json({
      success: false,
      message: `${member.fullName} is already checked in today at ${timeStr}`,
      alreadyCheckedIn: true,
      data: existingActive,
      member: {
        _id: member._id,
        fullName: member.fullName,
        memberId: member.memberId,
        photo: member.photo,
        phone: member.phone,
        membershipStatus: member.membershipStatus,
        planName: member.currentPlanId?.name || null,
      },
    });
  }

  const attendance = await Attendance.create({
    gymId,
    memberId: member._id,
    date: today,
    checkInTime: new Date(),
    method: 'qr',
    trainerId: member.trainerId || null,
  });

  res.status(201).json({
    success: true,
    action: 'checkin',
    message: `✅ Check-in recorded for ${member.fullName}!`,
    data: attendance,
    member: {
      _id: member._id,
      fullName: member.fullName,
      memberId: member.memberId,
      photo: member.photo,
      phone: member.phone,
      membershipStatus: member.membershipStatus,
      planName: member.currentPlanId?.name || null,
    },
  });
};

// GET /api/attendance
exports.getAttendance = async (req, res) => {
  const gymId = getGymId(req);
  const { date, memberId, page = 1, limit = 50, startDate, endDate } = req.query;

  const query = { gymId };
  if (date) query.date = date;
  if (memberId) query.memberId = memberId;
  if (startDate && endDate) {
    query.date = { $gte: startDate, $lte: endDate };
  }

  const total = await Attendance.countDocuments(query);
  const records = await Attendance.find(query)
    .populate('memberId', 'fullName memberId photo phone membershipStatus currentPlanId')
    .sort({ checkInTime: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({
    success: true,
    data: records,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
};

// GET /api/attendance/today
exports.getTodayAttendance = async (req, res) => {
  const gymId = getGymId(req);
  const today = getTodayString();

  const records = await Attendance.find({ gymId, date: today })
    .populate({
      path: 'memberId',
      select: 'fullName memberId photo phone membershipStatus currentPlanId',
      populate: { path: 'currentPlanId', select: 'name durationDays' },
    })
    .sort({ checkInTime: -1 });

  res.json({ success: true, data: records, count: records.length });
};

