const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/authenticate');

router.get('/stats', authenticate, ctrl.getDashboardStats);
router.get('/revenue-chart', authenticate, ctrl.getRevenueChart);
router.get('/attendance-chart', authenticate, ctrl.getAttendanceChart);
router.get('/recent-activity', authenticate, ctrl.getRecentActivity);

module.exports = router;
