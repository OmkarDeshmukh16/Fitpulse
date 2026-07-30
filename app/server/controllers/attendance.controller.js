const Attendance = require('../models/Attendance.model');
const Member = require('../models/Member.model');

const getGymId = (req) => req.user.gymId;

const getTodayString = () => new Date().toISOString().split('T')[0];

// POST /api/attendance/checkin
exports.checkIn = async (req, res) => {
  const gymId = getGymId(req);
  const { memberId, method = 'manual' } = req.body;

  const member = await Member.findOne({ _id: memberId, gymId, isDeleted: false });
  if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

  const today = getTodayString();

  // Check if already checked in today (and not yet checked out)
  const existing = await Attendance.findOne({ gymId, memberId, date: today, checkOutTime: null });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Member already checked in today' });
  }

  const attendance = await Attendance.create({
    gymId,
    memberId,
    date: today,
    checkInTime: new Date(),
    method,
    trainerId: member.trainerId || null,
  });

  res.status(201).json({ success: true, data: attendance, member: { fullName: member.fullName, memberId: member.memberId, photo: member.photo } });
};

// POST /api/attendance/checkout
exports.checkOut = async (req, res) => {
  const gymId = getGymId(req);
  const { memberId } = req.body;

  const today = getTodayString();
  const attendance = await Attendance.findOne({ gymId, memberId, date: today, checkOutTime: null });

  if (!attendance) {
    return res.status(404).json({ success: false, message: 'No active check-in found for today' });
  }

  attendance.checkOutTime = new Date();
  attendance.duration = Math.round(
    (attendance.checkOutTime - attendance.checkInTime) / (1000 * 60)
  );
  await attendance.save();

  res.json({ success: true, data: attendance });
};

// POST /api/attendance/checkin-qr
exports.checkInByQR = async (req, res) => {
  const gymId = getGymId(req);
  const { qrData } = req.body; // JSON string from QR scan

  let parsed;
  try {
    parsed = JSON.parse(qrData);
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid QR code' });
  }

  const member = await Member.findOne({ _id: parsed.memberId, gymId, isDeleted: false });
  if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

  req.body.memberId = member._id;
  req.body.method = 'qr';
  return exports.checkIn(req, res);
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
    .populate('memberId', 'fullName memberId photo phone')
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
    .populate('memberId', 'fullName memberId photo phone membershipStatus')
    .sort({ checkInTime: -1 });

  res.json({ success: true, data: records, count: records.length });
};
