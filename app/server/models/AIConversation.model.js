const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const mealSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Breakfast"
    items: [{ type: String }],
    calories: { type: Number },
  },
  { _id: false }
);

const workoutDaySchema = new mongoose.Schema(
  {
    day: { type: String, required: true }, // e.g. "Day 1"
    focus: { type: String, required: true }, // e.g. "Push - Chest/Shoulders/Triceps"
    exercises: [
      {
        name: { type: String, required: true },
        sets: { type: Number },
        reps: { type: String }, // string to allow "8-12", "AMRAP" etc.
      },
    ],
  },
  { _id: false }
);

const aiConversationSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Settings', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    goal: {
      type: String,
      enum: ['weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'general_fitness'],
      required: true,
    },
    profileSnapshot: {
      age: Number,
      weightKg: Number,
      heightCm: Number,
      gender: { type: String, enum: ['male', 'female', 'other'] },
      activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      },
    },
    messages: [messageSchema],
    currentPlan: {
      diet: {
        dailyCalories: Number,
        proteinGrams: Number,
        carbsGrams: Number,
        fatGrams: Number,
        fiberGrams: Number,
        meals: [mealSchema],
        notes: String,
      },
      workout: {
        daysPerWeek: Number,
        schedule: [workoutDaySchema],
        notes: String,
      },
      generatedAt: Date,
    },
    isActive: { type: Boolean, default: true }, // false once member starts a fresh conversation
  },
  { timestamps: true }
);

aiConversationSchema.index({ memberId: 1, isActive: 1 });

module.exports = mongoose.model('AIConversation', aiConversationSchema);
