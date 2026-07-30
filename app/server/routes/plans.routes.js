const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/plans.controller');
const { authenticate, authorize } = require('../middleware/authenticate');

const guard = authenticate;
const mgr = [authenticate, authorize('gymowner', 'manager', 'superadmin')];

router.get('/', guard, ctrl.getPlans);
router.get('/active', guard, ctrl.getActivePlans);
router.get('/:id', guard, ctrl.getPlan);
router.post('/', ...mgr, ctrl.createPlan);
router.put('/:id', ...mgr, ctrl.updatePlan);
router.delete('/:id', ...mgr, ctrl.deletePlan);
router.post('/assign', ...mgr, ctrl.assignPlan);

module.exports = router;
