const mongoose = require('mongoose');

const ptSessionSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Settings', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // e.g. "10:00"
    endTime: { type: String, required: true },   // e.g. "11:00"
    sessionType: {
      type: String,
      enum: ['strength', 'cardio', 'flexibility', 'mixed', 'assessment'],
      default: 'mixed',
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    notes: { type: String, default: '' },
    cancelReason: { type: String, default: '' },
  },
  { timestamps: true }
);

ptSessionSchema.index({ gymId: 1, memberId: 1, date: 1 });
ptSessionSchema.index({ gymId: 1, trainerId: 1, date: 1 });

module.exports = mongoose.model('PTSession', ptSessionSchema);
