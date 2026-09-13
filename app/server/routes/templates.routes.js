const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authenticate');
const ctrl = require('../controllers/templates.controller');

const staffOnly = [authenticate, authorize('trainer', 'gymowner', 'manager', 'superadmin')];

// Workout Templates
router.get('/workout', authenticate, ctrl.getWorkoutTemplates);
router.post('/workout', ...staffOnly, ctrl.createWorkoutTemplate);
router.put('/workout/:id', ...staffOnly, ctrl.updateWorkoutTemplate);
router.delete('/workout/:id', ...staffOnly, ctrl.deleteWorkoutTemplate);
router.post('/workout/:id/select', authenticate, ctrl.selectWorkoutTemplate);

// Diet Templates
router.get('/diet', authenticate, ctrl.getDietTemplates);
router.post('/diet', ...staffOnly, ctrl.createDietTemplate);
router.put('/diet/:id', ...staffOnly, ctrl.updateDietTemplate);
router.delete('/diet/:id', ...staffOnly, ctrl.deleteDietTemplate);
router.post('/diet/:id/select', authenticate, ctrl.selectDietTemplate);

module.exports = router;
