const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reports.controller');
const { authenticate, authorize } = require('../middleware/authenticate');

const mgr = [authenticate, authorize('gymowner', 'manager', 'superadmin')];

router.get('/revenue', ...mgr, ctrl.getRevenueReport);
router.get('/attendance', ...mgr, ctrl.getAttendanceReport);
router.get('/expiry', ...mgr, ctrl.getExpiryReport);
router.get('/lost-members', ...mgr, ctrl.getLostMembers);
router.get('/export/payments', ...mgr, ctrl.exportPayments);

module.exports = router;
