const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/payments.controller');
const { authenticate, authorize } = require('../middleware/authenticate');

const guard = authenticate;
const mgr = [authenticate, authorize('gymowner', 'manager', 'superadmin', 'receptionist')];

router.get('/', guard, ctrl.getPayments);
router.get('/:id', guard, ctrl.getPayment);
router.post('/', ...mgr, ctrl.createPayment);
router.put('/:id', ...mgr, ctrl.updatePayment);
router.post('/:id/refund', authenticate, authorize('gymowner', 'manager', 'superadmin'), ctrl.refundPayment);
router.get('/:id/receipt', guard, ctrl.downloadReceipt);

module.exports = router;
