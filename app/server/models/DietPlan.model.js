const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String, default: '' }, // e.g. "200g", "1 cup"
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 }, // grams
  carbs: { type: Number, default: 0 },
  fats: { type: Number, default: 0 },
}, { _id: false });

const mealSchema = new mongoose.Schema({
  mealName: { type: String, required: true }, // e.g. "Breakfast", "Pre-Workout"
  time: { type: String, default: '' }, // e.g. "7:00 AM"
  items: [foodItemSchema],
  notes: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { _id: false });

const dietPlanSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Settings', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true, trim: true },
    goal: { type: String, enum: ['weight_loss', 'muscle_gain', 'maintenance', 'lean_bulk', 'other'], default: 'maintenance' },
    dailyCalorieTarget: { type: Number, default: 2000 },
    dailyProteinTarget: { type: Number, default: 0 },
    dailyCarbsTarget: { type: Number, default: 0 },
    dailyFatsTarget: { type: Number, default: 0 },
    meals: [mealSchema],
    notes: { type: String, default: '' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

dietPlanSchema.index({ gymId: 1, memberId: 1, isActive: 1 });

module.exports = mongoose.model('DietPlan', dietPlanSchema);
