const AIConversation = require('../models/AIConversation.model');
const Member = require('../models/Member.model');
const { continueConversation } = require('../services/ai.service');

const getGymId = (req) => req.user.gymId;

// A 'member' role user's Member record — how you already link portal logins to Member docs.
const getMemberRecord = async (req) => Member.findOne({ userId: req.user._id, gymId: getGymId(req) });

// @route POST /api/ai/conversations
// body: { goal, profileSnapshot: { age, weightKg, heightCm, gender, activityLevel }, message }
exports.startConversation = async (req, res) => {
  const { goal, profileSnapshot, message } = req.body;

  if (!goal || !profileSnapshot || !message) {
    return res.status(400).json({ success: false, message: 'goal, profileSnapshot and message are required' });
  }

  const member = await getMemberRecord(req);
  if (!member) {
    return res.status(404).json({ success: false, message: 'Member profile not found for this account' });
  }

  // Retire any previous active conversation so history stays scoped to one thread at a time.
  await AIConversation.updateMany(
    { memberId: member._id, isActive: true },
    { $set: { isActive: false } }
  );

  const { assistantMessage, planUpdate } = await continueConversation({
    profileSnapshot,
    goal,
    medicalConditions: member.medicalConditions,
    history: [],
    userMessage: message,
  });

  const conversation = await AIConversation.create({
    gymId: getGymId(req),
    memberId: member._id,
    goal,
    profileSnapshot,
    messages: [
      { role: 'user', content: message },
      { role: 'assistant', content: assistantMessage },
    ],
    currentPlan: planUpdate ? { ...planUpdate, generatedAt: new Date() } : undefined,
  });

  res.status(201).json({ success: true, data: conversation });
};

// @route POST /api/ai/conversations/:id/messages
// body: { message }
exports.sendMessage = async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: 'message is required' });
  }

  const member = await getMemberRecord(req);
  const conversation = await AIConversation.findOne({
    _id: req.params.id,
    memberId: member._id,
  });

  if (!conversation) {
    return res.status(404).json({ success: false, message: 'Conversation not found' });
  }

  const { assistantMessage, planUpdate } = await continueConversation({
    profileSnapshot: conversation.profileSnapshot,
    goal: conversation.goal,
    medicalConditions: member.medicalConditions,
    history: conversation.messages.map((m) => ({ role: m.role, content: m.content })),
    userMessage: message,
  });

  conversation.messages.push({ role: 'user', content: message });
  conversation.messages.push({ role: 'assistant', content: assistantMessage });
  if (planUpdate) {
    conversation.currentPlan = { ...planUpdate, generatedAt: new Date() };
  }

  await conversation.save();

  res.json({ success: true, data: conversation });
};

// @route GET /api/ai/conversations/active
exports.getActiveConversation = async (req, res) => {
  const member = await getMemberRecord(req);
  const conversation = await AIConversation.findOne({ memberId: member._id, isActive: true }).sort({ updatedAt: -1 });
  res.json({ success: true, data: conversation || null });
};

// @route GET /api/ai/conversations
exports.getHistory = async (req, res) => {
  const member = await getMemberRecord(req);
  const conversations = await AIConversation.find({ memberId: member._id })
    .sort({ updatedAt: -1 })
    .select('goal currentPlan.generatedAt createdAt updatedAt isActive');
  res.json({ success: true, data: conversations });
};
