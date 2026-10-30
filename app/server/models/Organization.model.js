const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    isMain: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { _id: true, timestamps: true }
);

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Gym name is required'],
      trim: true,
      maxlength: [100, 'Gym name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Gym slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug may only contain lowercase alphanumeric characters and hyphens'],
    },
    status: {
      type: String,
      enum: ['trialing', 'active', 'past_due', 'suspended', 'cancelled'],
      default: 'trialing',
      index: true,
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
    },
    gracePeriodEndsAt: {
      type: Date,
      default: null,
    },
    billingEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    gstNumber: { type: String, default: '', trim: true },
    currency: { type: String, default: 'INR' },
    currencySymbol: { type: String, default: '₹' },
    timezone: { type: String, default: 'Asia/Kolkata' },

    // Primary owner / creator
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // 1:1 legacy link with Settings document
    settingsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Settings',
      default: null,
    },

    // Prepared for post-MVP custom branding & white-label domains
    customDomain: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
      sparse: true,
    },

    // Prepared for post-MVP multi-branch structure
    branches: [branchSchema],

    // Per-gym payment gateway credentials (encrypted at rest for member fee collections)
    razorpayConfig: {
      keyId: { type: String, default: '' },
      keySecretEncrypted: { type: String, default: '' },
      keySecretIv: { type: String, default: '' },
      keySecretTag: { type: String, default: '' },
      isEnabled: { type: Boolean, default: false },
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound and supplementary indexes
organizationSchema.index({ status: 1, isDeleted: 1 });

module.exports = mongoose.model('Organization', organizationSchema);
