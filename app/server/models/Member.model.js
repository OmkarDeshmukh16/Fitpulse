const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const memberSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Settings', required: true },
    memberId: { type: String, unique: true, default: () => `FP-${Date.now()}` },
    qrCode: { type: String, default: '' }, // base64 QR image or URL
    photo: { type: String, default: '' },
    fullName: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    dob: { type: Date },
    phone: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String },
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      default: '',
    },
    medicalConditions: { type: String, default: '' },
    joinDate: { type: Date, default: Date.now },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    currentPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan', default: null },
    membershipStatus: {
      type: String,
      enum: ['active', 'inactive', 'frozen', 'expired'],
      default: 'active',
    },
    notes: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // for member portal login
    bodyStats: {
      age: { type: Number },
      gender: { type: String, enum: ['male', 'female'] },
      weightKg: { type: Number },
      heightCm: { type: Number },
      activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      },
      updatedAt: { type: Date },
    },
  },
  { timestamps: true }
);

memberSchema.index({ gymId: 1, membershipStatus: 1 });
memberSchema.index({ gymId: 1, fullName: 'text', phone: 'text', email: 'text' });

module.exports = mongoose.model('Member', memberSchema);
