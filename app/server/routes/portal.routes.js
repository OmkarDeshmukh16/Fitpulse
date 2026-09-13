const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authenticate');
const {
  getDashboard,
  getProfile,
  updateProfile,
  getMyBodyStats,
  updateMyBodyStats,
  getMembership,
  getAttendance,
  getWorkoutPlan,
  getDietPlan,
  getProgress,
  addProgress,
  getPTSessions,
  bookPTSession,
  cancelPTSession,
  getPayments,
  downloadReceipt,
  createRenewalOrder,
  verifyRenewalPayment,
} = require('../controllers/portal.controller');

// All portal routes require authentication + member role
router.use(authenticate, authorize('member'));

// Profile / Account
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Body Stats
router.get('/body-stats', getMyBodyStats);
router.put('/body-stats', updateMyBodyStats);

// Dashboard
router.get('/dashboard', getDashboard);

// Membership
router.get('/membership', getMembership);

// Attendance
router.get('/attendance', getAttendance);

// Workout Plan
router.get('/workout-plan', getWorkoutPlan);

// Diet Plan
router.get('/diet-plan', getDietPlan);

// Progress
router.get('/progress', getProgress);
router.post('/progress', addProgress);

// PT Sessions
router.get('/pt-sessions', getPTSessions);
router.post('/pt-sessions', bookPTSession);
router.put('/pt-sessions/:id/cancel', cancelPTSession);

// Payments
router.get('/payments', getPayments);
router.get('/payments/:id/receipt', downloadReceipt);

// Razorpay Renewal
router.post('/renew/create-order', createRenewalOrder);
router.post('/renew/verify', verifyRenewalPayment);

module.exports = router;
