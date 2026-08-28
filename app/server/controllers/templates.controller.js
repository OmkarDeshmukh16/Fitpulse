const WorkoutPlan = require('../models/WorkoutPlan.model');
const DietPlan = require('../models/DietPlan.model');
const Member = require('../models/Member.model');

const getGymId = (req) => req.user.gymId;

const sanitizeDays = (days) => {
  return (days || []).map((d, dIdx) => ({
    dayName: (d.dayName || '').trim() || `Day ${dIdx + 1}`,
    focus: (d.focus || '').trim(),
    isRestDay: !!d.isRestDay,
    exercises: (d.exercises || [])
      .filter((e) => e && ((e.name && e.name.trim()) || e.sets || e.reps || e.duration))
      .map((e, eIdx) => ({
        name: (e.name || '').trim() || `Exercise ${eIdx + 1}`,
        sets: Number(e.sets) || 3,
        reps: String(e.reps || '12'),
        duration: String(e.duration || ''),
        restSeconds: Number(e.restSeconds) || 60,
        notes: String(e.notes || ''),
        order: Number(e.order) || eIdx,
      })),
  }));
};

const sanitizeMeals = (meals) => {
  return (meals || []).map((m, mIdx) => ({
    mealName: (m.mealName || '').trim() || `Meal ${mIdx + 1}`,
    time: (m.time || '').trim(),
    notes: (m.notes || '').trim(),
    order: Number(m.order) || mIdx,
    items: (m.items || [])
      .filter((it) => it && ((it.name && it.name.trim()) || it.calories || it.protein || it.quantity))
      .map((it, itIdx) => ({
        name: (it.name || '').trim() || `Item ${itIdx + 1}`,
        quantity: String(it.quantity || ''),
        calories: Number(it.calories) || 0,
        protein: Number(it.protein) || 0,
        carbs: Number(it.carbs) || 0,
        fats: Number(it.fats) || 0,
      })),
  }));
};

// @route GET /api/fitness-templates/workout
// @access Private (Staff & Members)
exports.getWorkoutTemplates = async (req, res) => {
  const gymId = getGymId(req);
  const templates = await WorkoutPlan.find({
    gymId,
    isTemplate: true,
    isDeleted: { $ne: true },
  })
    .populate('trainerId', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: templates });
};

// @route POST /api/fitness-templates/workout
// @access Private (Staff only)
exports.createWorkoutTemplate = async (req, res) => {
  const gymId = getGymId(req);
  const { templateName, templateDescription, goalTag, days } = req.body;

  if (!templateName || !templateName.trim()) {
    return res.status(400).json({ success: false, message: 'Template name is required' });
  }

  const nameVal = templateName.trim();

  const template = await WorkoutPlan.create({
    gymId,
    trainerId: req.user._id,
    memberId: null,
    isTemplate: true,
    isActive: false,
    templateName: nameVal,
    name: nameVal,
    templateDescription: (templateDescription || '').trim(),
    description: (templateDescription || '').trim(),
    goalTag: goalTag || 'maintenance',
    days: sanitizeDays(days),
  });

  res.status(201).json({ success: true, data: template });
};

// @route PUT /api/fitness-templates/workout/:id
// @access Private (Staff only)
exports.updateWorkoutTemplate = async (req, res) => {
  const gymId = getGymId(req);
  const { templateName, templateDescription, goalTag, days } = req.body;

  const template = await WorkoutPlan.findOne({
    _id: req.params.id,
    gymId,
    isTemplate: true,
    isDeleted: { $ne: true },
  });

  if (!template) {
    return res.status(404).json({ success: false, message: 'Workout template not found' });
  }

  if (templateName !== undefined) {
    const trimmed = templateName.trim();
    if (trimmed) {
      template.templateName = trimmed;
      template.name = trimmed;
    }
  }
  if (templateDescription !== undefined) {
    template.templateDescription = templateDescription.trim();
    template.description = templateDescription.trim();
  }
  if (goalTag !== undefined) template.goalTag = goalTag;
  if (days !== undefined) template.days = sanitizeDays(days);

  await template.save();

  res.json({ success: true, data: template });
};

// @route DELETE /api/fitness-templates/workout/:id
// @access Private (Staff only)
exports.deleteWorkoutTemplate = async (req, res) => {
  const gymId = getGymId(req);
  const template = await WorkoutPlan.findOneAndUpdate(
    { _id: req.params.id, gymId, isTemplate: true },
    { isDeleted: true },
    { new: true }
  );

  if (!template) {
    return res.status(404).json({ success: false, message: 'Workout template not found' });
  }

  res.json({ success: true, message: 'Workout template deleted successfully' });
};

// @route POST /api/fitness-templates/workout/:id/select
// @access Private (Members only)
exports.selectWorkoutTemplate = async (req, res) => {
  const member = await Member.findOne({ userId: req.user._id, isDeleted: false });
  if (!member) {
    return res.status(404).json({ success: false, message: 'Member profile not found' });
  }

  const template = await WorkoutPlan.findOne({
    _id: req.params.id,
    gymId: member.gymId,
    isTemplate: true,
    isDeleted: { $ne: true },
  });

  if (!template) {
    return res.status(404).json({ success: false, message: 'Workout template not found' });
  }

  // Deactivate any existing active workout plan for this member
  await WorkoutPlan.updateMany(
    { gymId: member.gymId, memberId: member._id, isActive: true },
    { isActive: false }
  );

  // Clone days & exercises into new member plan document
  const clonedDays = sanitizeDays(template.days);

  const newPlan = await WorkoutPlan.create({
    gymId: member.gymId,
    memberId: member._id,
    trainerId: template.trainerId || null,
    name: template.templateName || template.name || 'Workout Plan',
    description: template.templateDescription || template.description || '',
    days: clonedDays,
    isTemplate: false,
    isActive: true,
    startDate: new Date(),
  });

  res.status(201).json({
    success: true,
    data: newPlan,
    message: 'Workout plan assigned and activated successfully!',
  });
};

// @route GET /api/fitness-templates/diet
// @access Private (Staff & Members)
exports.getDietTemplates = async (req, res) => {
  const gymId = getGymId(req);
  const templates = await DietPlan.find({
    gymId,
    isTemplate: true,
    isDeleted: { $ne: true },
  })
    .populate('trainerId', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: templates });
};

// @route POST /api/fitness-templates/diet
// @access Private (Staff only)
exports.createDietTemplate = async (req, res) => {
  const gymId = getGymId(req);
  const {
    templateName,
    templateDescription,
    goalTag,
    dailyCalorieTarget,
    dailyProteinTarget,
    dailyCarbsTarget,
    dailyFatsTarget,
    meals,
    notes,
  } = req.body;

  if (!templateName || !templateName.trim()) {
    return res.status(400).json({ success: false, message: 'Template name is required' });
  }

  const nameVal = templateName.trim();

  const template = await DietPlan.create({
    gymId,
    trainerId: req.user._id,
    memberId: null,
    isTemplate: true,
    isActive: false,
    templateName: nameVal,
    name: nameVal,
    templateDescription: (templateDescription || '').trim(),
    notes: notes || templateDescription || '',
    goalTag: goalTag || 'maintenance',
    goal: goalTag || 'maintenance',
    dailyCalorieTarget: Number(dailyCalorieTarget) || 2000,
    dailyProteinTarget: Number(dailyProteinTarget) || 0,
    dailyCarbsTarget: Number(dailyCarbsTarget) || 0,
    dailyFatsTarget: Number(dailyFatsTarget) || 0,
    meals: sanitizeMeals(meals),
  });

  res.status(201).json({ success: true, data: template });
};

// @route PUT /api/fitness-templates/diet/:id
// @access Private (Staff only)
exports.updateDietTemplate = async (req, res) => {
  const gymId = getGymId(req);
  const {
    templateName,
    templateDescription,
    goalTag,
    dailyCalorieTarget,
    dailyProteinTarget,
    dailyCarbsTarget,
    dailyFatsTarget,
    meals,
    notes,
  } = req.body;

  const template = await DietPlan.findOne({
    _id: req.params.id,
    gymId,
    isTemplate: true,
    isDeleted: { $ne: true },
  });

  if (!template) {
    return res.status(404).json({ success: false, message: 'Diet template not found' });
  }

  if (templateName !== undefined) {
    const trimmed = templateName.trim();
    if (trimmed) {
      template.templateName = trimmed;
      template.name = trimmed;
    }
  }
  if (templateDescription !== undefined) {
    template.templateDescription = templateDescription.trim();
  }
  if (goalTag !== undefined) {
    template.goalTag = goalTag;
    template.goal = goalTag;
  }
  if (dailyCalorieTarget !== undefined) template.dailyCalorieTarget = Number(dailyCalorieTarget) || 0;
  if (dailyProteinTarget !== undefined) template.dailyProteinTarget = Number(dailyProteinTarget) || 0;
  if (dailyCarbsTarget !== undefined) template.dailyCarbsTarget = Number(dailyCarbsTarget) || 0;
  if (dailyFatsTarget !== undefined) template.dailyFatsTarget = Number(dailyFatsTarget) || 0;
  if (meals !== undefined) template.meals = sanitizeMeals(meals);
  if (notes !== undefined) template.notes = notes;

  await template.save();

  res.json({ success: true, data: template });
};

// @route DELETE /api/fitness-templates/diet/:id
// @access Private (Staff only)
exports.deleteDietTemplate = async (req, res) => {
  const gymId = getGymId(req);
  const template = await DietPlan.findOneAndUpdate(
    { _id: req.params.id, gymId, isTemplate: true },
    { isDeleted: true },
    { new: true }
  );

  if (!template) {
    return res.status(404).json({ success: false, message: 'Diet template not found' });
  }

  res.json({ success: true, message: 'Diet template deleted successfully' });
};

// @route POST /api/fitness-templates/diet/:id/select
// @access Private (Members only)
exports.selectDietTemplate = async (req, res) => {
  const member = await Member.findOne({ userId: req.user._id, isDeleted: false });
  if (!member) {
    return res.status(404).json({ success: false, message: 'Member profile not found' });
  }

  const template = await DietPlan.findOne({
    _id: req.params.id,
    gymId: member.gymId,
    isTemplate: true,
    isDeleted: { $ne: true },
  });

  if (!template) {
    return res.status(404).json({ success: false, message: 'Diet template not found' });
  }

  // Deactivate any existing active diet plan for this member
  await DietPlan.updateMany(
    { gymId: member.gymId, memberId: member._id, isActive: true },
    { isActive: false }
  );

  // Clone meals & food items into new member plan document
  const clonedMeals = sanitizeMeals(template.meals);

  const newPlan = await DietPlan.create({
    gymId: member.gymId,
    memberId: member._id,
    trainerId: template.trainerId || null,
    name: template.templateName || template.name || 'Diet Plan',
    goal: template.goalTag || template.goal || 'maintenance',
    dailyCalorieTarget: template.dailyCalorieTarget ?? 2000,
    dailyProteinTarget: template.dailyProteinTarget ?? 0,
    dailyCarbsTarget: template.dailyCarbsTarget ?? 0,
    dailyFatsTarget: template.dailyFatsTarget ?? 0,
    meals: clonedMeals,
    notes: template.templateDescription || template.notes || '',
    isTemplate: false,
    isActive: true,
    startDate: new Date(),
  });

  res.status(201).json({
    success: true,
    data: newPlan,
    message: 'Diet plan assigned and activated successfully!',
  });
};
