const Payment = require('../models/Payment.model');
const Member = require('../models/Member.model');
const Attendance = require('../models/Attendance.model');
const { Membership } = require('../models/MembershipPlan.model');
const Settings = require('../models/Settings.model');
const ActivityLog = require('../models/ActivityLog.model');
const sendEmail = require('../services/email.service');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');

const getGymId = (req) => req.user.gymId;

// GET /api/reports/revenue
exports.getRevenueReport = async (req, res) => {
  const gymId = getGymId(req);
  const { startDate, endDate, groupBy = 'day' } = req.query;

  const match = { gymId, status: { $in: ['paid', 'partial'] } };
  if (startDate && endDate) {
    match.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  let groupId;
  if (groupBy === 'month') {
    groupId = { year: { $year: '$date' }, month: { $month: '$date' } };
  } else {
    groupId = { year: { $year: '$date' }, month: { $month: '$date' }, day: { $dayOfMonth: '$date' } };
  }

  const data = await Payment.aggregate([
    { $match: match },
    { $group: { _id: groupId, revenue: { $sum: '$paidAmount' }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  const summary = await Payment.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$paidAmount' },
        totalTransactions: { $sum: 1 },
        avgTransaction: { $avg: '$paidAmount' },
        pendingDues: { $sum: '$dueAmount' },
      },
    },
  ]);

  res.json({ success: true, data, summary: summary[0] || {} });
};

// GET /api/reports/attendance
exports.getAttendanceReport = async (req, res) => {
  const gymId = getGymId(req);
  const { startDate, endDate } = req.query;

  const match = { gymId };
  if (startDate && endDate) {
    match.date = { $gte: startDate, $lte: endDate };
  }

  const daily = await Attendance.aggregate([
    { $match: match },
    { $group: { _id: '$date', count: { $sum: 1 }, avgDuration: { $avg: '$duration' } } },
    { $sort: { _id: 1 } },
  ]);

  const totalCheckIns = daily.reduce((sum, d) => sum + d.count, 0);
  const uniqueMembers = await Attendance.distinct('memberId', match);

  res.json({ success: true, data: daily, summary: { totalCheckIns, uniqueMembers: uniqueMembers.length } });
};

// GET /api/reports/expiry
exports.getExpiryReport = async (req, res) => {
  const gymId = getGymId(req);
  const { days = 30 } = req.query;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + Number(days));

  const expiring = await Membership.find({
    gymId,
    status: 'active',
    endDate: { $gte: new Date(), $lte: futureDate },
  })
    .populate('memberId', 'fullName phone email memberId')
    .populate('planId', 'name price')
    .sort({ endDate: 1 });

  res.json({ success: true, data: expiring, count: expiring.length });
};

// GET /api/reports/lost-members
exports.getLostMembers = async (req, res) => {
  const gymId = getGymId(req);
  const members = await Member.find({ gymId, isDeleted: false, membershipStatus: { $in: ['expired', 'inactive'] } })
    .populate('currentPlanId', 'name')
    .sort({ updatedAt: -1 });

  res.json({ success: true, data: members, count: members.length });
};

// POST /api/reports/lost-members/campaign
exports.sendLostMembersCampaign = async (req, res) => {
  const gymId = getGymId(req);
  const { memberIds, offerTitle, message, sendEmailToAvailable } = req.body;

  if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    return res.status(400).json({ success: false, message: 'No members selected' });
  }

  const query = { gymId, _id: { $in: memberIds }, isDeleted: false };
  const members = await Member.find(query).populate('currentPlanId', 'name');
  const gymSettings = await Settings.findById(gymId);
  const gymName = gymSettings?.gymName || 'Fitpulse';

  let emailedCount = 0;
  if (sendEmailToAvailable) {
    for (const member of members) {
      if (member.email) {
        try {
          const personalizedMsg = (message || '')
            .replace(/\{name\}/gi, member.fullName)
            .replace(/\{gymName\}/gi, gymName)
            .replace(/\{planName\}/gi, member.currentPlanId?.name || 'Membership');

          await sendEmail({
            to: member.email,
            subject: offerTitle || `Special Exclusive Offer from ${gymName}!`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                <h2 style="color: #6366f1; margin-bottom: 16px; font-size: 20px;">${offerTitle || 'Special Offer for You!'}</h2>
                <div style="font-size: 15px; line-height: 1.6; color: #334155; white-space: pre-line; background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #6366f1;">${personalizedMsg}</div>
                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
                  <p style="margin: 0 0 4px 0;">Warm regards,</p>
                  <p style="margin: 0; font-weight: bold; color: #1e293b;">${gymName} Team</p>
                  ${gymSettings?.phone ? `<p style="margin: 4px 0 0 0;">📞 Contact: ${gymSettings.phone}</p>` : ''}
                </div>
              </div>
            `,
          });
          emailedCount++;
        } catch (err) {
          console.error(`Failed to send email to ${member.email}:`, err.message);
        }
      }
    }
  }

  // Log activity
  try {
    await ActivityLog.create({
      gymId,
      userId: req.user._id,
      action: 'campaign.lost_members',
      entity: 'member',
      description: `Sent re-engagement campaign "${offerTitle || 'Exclusive Offer'}" to ${members.length} inactive members.`,
      metadata: { count: members.length, offerTitle, emailedCount },
    });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }

  res.json({
    success: true,
    message: `Campaign initiated for ${members.length} members.`,
    count: members.length,
    emailedCount,
  });
};

// GET /api/reports/export/payments?format=csv|excel
exports.exportPayments = async (req, res) => {
  const gymId = getGymId(req);
  const { format = 'csv', startDate, endDate } = req.query;

  const match = { gymId };
  if (startDate && endDate) match.date = { $gte: new Date(startDate), $lte: new Date(endDate) };

  const payments = await Payment.find(match)
    .populate('memberId', 'fullName memberId phone')
    .sort({ date: -1 })
    .lean();

  const rows = payments.map((p) => ({
    'Invoice No': p.invoiceNumber,
    'Member Name': p.memberId?.fullName,
    'Member ID': p.memberId?.memberId,
    Amount: p.amount,
    'Paid Amount': p.paidAmount,
    'Due Amount': p.dueAmount,
    Method: p.method,
    Status: p.status,
    Date: new Date(p.date).toLocaleDateString('en-IN'),
  }));

  if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Payments');
    sheet.columns = Object.keys(rows[0] || {}).map((key) => ({ header: key, key, width: 20 }));
    sheet.addRows(rows);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="payments.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } else {
    const parser = new Parser();
    const csv = parser.parse(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="payments.csv"');
    res.send(csv);
  }
};
