const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Settings', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    date: { type: Date, default: Date.now },
    weight: { type: Number, default: null }, // kg
    bodyFat: { type: Number, default: null }, // percentage
    chest: { type: Number, default: null }, // cm
    waist: { type: Number, default: null },
    hips: { type: Number, default: null },
    biceps: { type: Number, default: null },
    thighs: { type: Number, default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

progressSchema.index({ gymId: 1, memberId: 1, date: -1 });

module.exports = mongoose.model('Progress', progressSchema);
