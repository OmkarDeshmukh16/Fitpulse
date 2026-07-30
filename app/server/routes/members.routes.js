const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/members.controller');
const { authenticate, authorize } = require('../middleware/authenticate');

const guard = authenticate;
const managerPlus = [authenticate, authorize('gymowner', 'manager', 'superadmin')];

router.get('/', guard, ctrl.getMembers);
router.get('/:id', guard, ctrl.getMember);
router.post('/', ...managerPlus, ctrl.createMember);
router.put('/:id', ...managerPlus, ctrl.updateMember);
router.delete('/:id', ...managerPlus, ctrl.deleteMember);
router.post('/:id/freeze', ...managerPlus, ctrl.freezeMembership);
router.post('/:id/unfreeze', ...managerPlus, ctrl.unfreezeMembership);
router.get('/:id/attendance', guard, ctrl.getMemberAttendance);
router.get('/:id/payments', guard, ctrl.getMemberPayments);
router.get('/:id/card', guard, ctrl.downloadMemberCard);

module.exports = router;
