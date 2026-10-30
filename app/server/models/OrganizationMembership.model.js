const mongoose = require('mongoose');

const organizationMembershipSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['gymowner', 'manager', 'trainer', 'receptionist', 'member'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'invited', 'suspended', 'inactive'],
      default: 'active',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    permissions: [{ type: String }],
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound Unique Index: One user can only hold one membership record per organization
organizationMembershipSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
organizationMembershipSchema.index({ userId: 1, isDefault: 1 });
organizationMembershipSchema.index({ organizationId: 1, role: 1 });

module.exports = mongoose.model('OrganizationMembership', organizationMembershipSchema);
