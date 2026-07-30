const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Settings' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true }, // e.g. 'member.created', 'payment.recorded'
    entity: { type: String }, // 'member', 'payment', etc.
    entityId: { type: mongoose.Schema.Types.ObjectId },
    description: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

activityLogSchema.index({ gymId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
