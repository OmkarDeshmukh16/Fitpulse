const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, default: 3 },
  reps: { type: String, default: '12' }, // string to allow ranges like "8-12"
  duration: { type: String, default: '' }, // e.g. "30 sec", "5 min"
  restSeconds: { type: Number, default: 60 },
  notes: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { _id: false });

const daySchema = new mongoose.Schema({
  dayName: { type: String, required: true }, // e.g. "Monday", "Day 1"
  focus: { type: String, default: '' }, // e.g. "Chest & Triceps"
  exercises: [exerciseSchema],
  isRestDay: { type: Boolean, default: false },
}, { _id: false });

const workoutPlanSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Settings', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    days: [daySchema],
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

workoutPlanSchema.index({ gymId: 1, memberId: 1, isActive: 1 });

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
