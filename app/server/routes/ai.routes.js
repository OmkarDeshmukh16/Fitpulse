const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ai.controller');
const { authenticate, authorize } = require('../middleware/authenticate');

// Only the member role uses this bot from their own portal.
const memberOnly = [authenticate, authorize('member')];

router.post('/conversations', ...memberOnly, ctrl.startConversation);
router.post('/conversations/:id/messages', ...memberOnly, ctrl.sendMessage);
router.get('/conversations/active', ...memberOnly, ctrl.getActiveConversation);
router.get('/conversations', ...memberOnly, ctrl.getHistory);

module.exports = router;
