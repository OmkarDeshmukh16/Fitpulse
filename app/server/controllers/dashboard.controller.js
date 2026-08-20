const Member = require('../models/Member.model');
const Attendance = require('../models/Attendance.model');
const Payment = require('../models/Payment.model');
const { Membership } = require('../models/MembershipPlan.model');

const getGymId = (req) => req.user.gymId;

// @route GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  const gymId = getGymId(req);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const [
    totalMembers,
    activeMembers,
    inactiveMembers,
    newMembersThisMonth,
    todayCheckIns,
    todayRevenue,
    monthlyRevenue,
    pendingPayments,
    expiringMemberships,
  ] = await Promise.all([
    Member.countDocuments({ gymId, isDeleted: false }),
    Member.countDocuments({ gymId, membershipStatus: 'active', isDeleted: false }),
    Member.countDocuments({ gymId, membershipStatus: { $in: ['inactive', 'expired'] }, isDeleted: false }),
    Member.countDocuments({ gymId, isDeleted: false, createdAt: { $gte: startOfMonth, $lte: endOfMonth } }),
    Attendance.countDocuments({ gymId, checkInTime: { $gte: startOfDay, $lte: endOfDay } }),
    Payment.aggregate([
      { $match: { gymId, date: { $gte: startOfDay, $lte: endOfDay }, status: { $in: ['paid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } },
    ]),
    Payment.aggregate([
      { $match: { gymId, date: { $gte: startOfMonth, $lte: endOfMonth }, status: { $in: ['paid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } },
    ]),
    Payment.aggregate([
      { $match: { gymId, status: 'partial' } },
      { $group: { _id: null, total: { $sum: '$dueAmount' } } },
    ]),
    Membership.countDocuments({
      gymId,
      status: 'active',
      endDate: { $gte: new Date(), $lte: sevenDaysFromNow },
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalMembers,
      activeMembers,
      inactiveMembers,
      newMembersThisMonth,
      todayCheckIns,
      todayRevenue: todayRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      pendingPayments: pendingPayments[0]?.total || 0,
      expiringMemberships,
    },
  });
};

// @route GET /api/dashboard/revenue-chart
exports.getRevenueChart = async (req, res) => {
  const gymId = getGymId(req);
  const { months = 6 } = req.query;

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - Number(months) + 1);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const data = await Payment.aggregate([
    { $match: { gymId, date: { $gte: startDate }, status: { $in: ['paid', 'partial'] } } },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        revenue: { $sum: '$paidAmount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({ success: true, data });
};

// @route GET /api/dashboard/attendance-chart
exports.getAttendanceChart = async (req, res) => {
  const gymId = getGymId(req);
  const { days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));

  const data = await Attendance.aggregate([
    { $match: { gymId, checkInTime: { $gte: startDate } } },
    { $group: { _id: '$date', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  res.json({ success: true, data });
};

// @route GET /api/dashboard/recent-activity
exports.getRecentActivity = async (req, res) => {
  const gymId = getGymId(req);

  const [recentPayments, recentMembers, todayBirthdays, upcomingRenewals] = await Promise.all([
    Payment.find({ gymId }).sort({ createdAt: -1 }).limit(5).populate('memberId', 'fullName memberId'),
    Member.find({ gymId, isDeleted: false }).sort({ createdAt: -1 }).limit(5),
    (() => {
      const today = new Date();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      return Member.find({
        gymId,
        isDeleted: false,
        $expr: {
          $and: [
            { $eq: [{ $month: '$dob' }, today.getMonth() + 1] },
            { $eq: [{ $dayOfMonth: '$dob' }, today.getDate()] },
          ],
        },
      }).select('fullName dob phone');
    })(),
    (() => {
      const sevenDays = new Date();
      sevenDays.setDate(sevenDays.getDate() + 7);
      return Membership.find({
        gymId,
        status: 'active',
        endDate: { $gte: new Date(), $lte: sevenDays },
      })
        .populate('memberId', 'fullName phone email')
        .populate('planId', 'name price')
        .sort({ endDate: 1 })
        .limit(10);
    })(),
  ]);

  res.json({ success: true, data: { recentPayments, recentMembers, todayBirthdays, upcomingRenewals } });
};
