const express = require('express');
const router = express.Router();
const {
  createDemoRequest,
  getDemoRequests,
  updateDemoRequest,
  sendPaymentLink,
  approveAndProvisionGym,
  seedSuperAdmin,
} = require('../controllers/demo.controller');
const { authenticate, authorize } = require('../middleware/authenticate');

// Public route: Submit demo request from landing page
router.post('/', createDemoRequest);

// Public route: Seed superadmin for setup/testing
router.post('/seed-superadmin', seedSuperAdmin);

// Super Admin protected routes
router.get('/', authenticate, authorize('superadmin'), getDemoRequests);
router.patch('/:id', authenticate, authorize('superadmin'), updateDemoRequest);
router.post('/:id/send-payment-link', authenticate, authorize('superadmin'), sendPaymentLink);
router.post('/:id/approve', authenticate, authorize('superadmin'), approveAndProvisionGym);

module.exports = router;
