const express = require('express');
const router = express.Router();
const {
  login, refreshToken, logout, forgotPassword, resetPassword, getMe,
  switchGym, impersonateGym,
} = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/authenticate');

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', authenticate, getMe);
router.post('/switch-gym/:orgId', authenticate, switchGym);
router.post('/impersonate/:orgId', authenticate, authorize('superadmin'), impersonateGym);

module.exports = router;

