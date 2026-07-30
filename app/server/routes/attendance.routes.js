const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attendance.controller');
const { authenticate } = require('../middleware/authenticate');

router.post('/checkin', authenticate, ctrl.checkIn);
router.post('/checkout', authenticate, ctrl.checkOut);
router.post('/checkin-qr', authenticate, ctrl.checkInByQR);
router.get('/today', authenticate, ctrl.getTodayAttendance);
router.get('/', authenticate, ctrl.getAttendance);

module.exports = router;
