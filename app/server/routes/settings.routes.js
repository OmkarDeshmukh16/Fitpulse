const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/settings.controller');
const { authenticate, authorize } = require('../middleware/authenticate');

const ownerOnly = [authenticate, authorize('gymowner', 'superadmin')];
const guard = authenticate;

router.post('/setup', ctrl.initialSetup); // Public — first-time setup
router.get('/', guard, ctrl.getSettings);
router.put('/', ...ownerOnly, ctrl.updateSettings);
router.get('/staff', guard, ctrl.getStaff);
router.post('/staff', ...ownerOnly, ctrl.addStaff);
router.put('/staff/:id', ...ownerOnly, ctrl.updateStaff);

module.exports = router;
