const WorkoutPlan = require('../models/WorkoutPlan.model');
const DietPlan = require('../models/DietPlan.model');

const getGymId = (req) => req.user.gymId;

// GET /api/members/:id/workout-plan
exports.getWorkoutPlanForMember = async (req, res) => {
  const gymId = getGymId(req);
  const memberId = req.params.id;

  const plan = await WorkoutPlan.findOne({
    memberId,
    gymId,
    isActive: true,
  }).populate('trainerId', 'name avatar');

  res.json({ success: true, data: plan });
};

// PUT /api/members/:id/workout-plan
exports.upsertWorkoutPlan = async (req, res) => {
  const gymId = getGymId(req);
  const memberId = req.params.id;
  const { name, description, days, startDate, endDate } = req.body;

  let plan = await WorkoutPlan.findOne({
    memberId,
    gymId,
    isActive: true,
  });

  if (plan) {
    if (name !== undefined) plan.name = name;
    if (description !== undefined) plan.description = description;
    if (days !== undefined) plan.days = days;
    if (startDate) plan.startDate = startDate;
    if (endDate !== undefined) plan.endDate = endDate;
    plan.trainerId = req.user._id;

    await plan.save();
    return res.json({ success: true, data: plan });
  }

  plan = await WorkoutPlan.create({
    gymId,
    memberId,
    trainerId: req.user._id,
    name: name || 'Workout Plan',
    description: description || '',
    days: days || [],
    startDate: startDate || Date.now(),
    endDate: endDate || null,
    isActive: true,
  });

  res.status(201).json({ success: true, data: plan });
};

// GET /api/members/:id/diet-plan
exports.getDietPlanForMember = async (req, res) => {
  const gymId = getGymId(req);
  const memberId = req.params.id;

  const plan = await DietPlan.findOne({
    memberId,
    gymId,
    isActive: true,
  }).populate('trainerId', 'name avatar');

  res.json({ success: true, data: plan });
};

// PUT /api/members/:id/diet-plan
exports.upsertDietPlan = async (req, res) => {
  const gymId = getGymId(req);
  const memberId = req.params.id;
  const {
    name,
    goal,
    dailyCalorieTarget,
    dailyProteinTarget,
    dailyCarbsTarget,
    dailyFatsTarget,
    meals,
    notes,
    startDate,
    endDate,
  } = req.body;

  let plan = await DietPlan.findOne({
    memberId,
    gymId,
    isActive: true,
  });

  if (plan) {
    if (name !== undefined) plan.name = name;
    if (goal !== undefined) plan.goal = goal;
    if (dailyCalorieTarget !== undefined) plan.dailyCalorieTarget = dailyCalorieTarget;
    if (dailyProteinTarget !== undefined) plan.dailyProteinTarget = dailyProteinTarget;
    if (dailyCarbsTarget !== undefined) plan.dailyCarbsTarget = dailyCarbsTarget;
    if (dailyFatsTarget !== undefined) plan.dailyFatsTarget = dailyFatsTarget;
    if (meals !== undefined) plan.meals = meals;
    if (notes !== undefined) plan.notes = notes;
    if (startDate) plan.startDate = startDate;
    if (endDate !== undefined) plan.endDate = endDate;
    plan.trainerId = req.user._id;

    await plan.save();
    return res.json({ success: true, data: plan });
  }

  plan = await DietPlan.create({
    gymId,
    memberId,
    trainerId: req.user._id,
    name: name || 'Diet Plan',
    goal: goal || 'maintenance',
    dailyCalorieTarget: dailyCalorieTarget ?? 2000,
    dailyProteinTarget: dailyProteinTarget ?? 0,
    dailyCarbsTarget: dailyCarbsTarget ?? 0,
    dailyFatsTarget: dailyFatsTarget ?? 0,
    meals: meals || [],
    notes: notes || '',
    startDate: startDate || Date.now(),
    endDate: endDate || null,
    isActive: true,
  });

  res.status(201).json({ success: true, data: plan });
};
