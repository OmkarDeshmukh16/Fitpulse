const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Settings', required: true },
    name: { type: String, required: true, trim: true },
    durationDays: { type: Number, required: true }, // e.g. 30, 90, 365
    price: { type: Number, required: true },
    features: [{ type: String }],
    personalTrainingIncluded: { type: Boolean, default: false },
    maxFreezeDays: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    color: { type: String, default: '#6366f1' }, // for UI card accent
  },
  { timestamps: true }
);

const membershipSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Settings', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'expired', 'frozen', 'cancelled'], default: 'active' },
    freezeStartDate: { type: Date, default: null },
    freezeEndDate: { type: Date, default: null },
    totalFreezeDaysUsed: { type: Number, default: 0 },
    renewedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership', default: null },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
  },
  { timestamps: true }
);

membershipSchema.index({ gymId: 1, endDate: 1, status: 1 });

const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema);
const Membership = mongoose.model('Membership', membershipSchema);

module.exports = { MembershipPlan, Membership };
