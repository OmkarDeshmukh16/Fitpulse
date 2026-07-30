const express = require('express');
const router = express.Router();
const {
  login, refreshToken, logout, forgotPassword, resetPassword, getMe,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/authenticate');

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', authenticate, getMe);

module.exports = router;
