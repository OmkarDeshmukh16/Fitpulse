const mongoose = require('mongoose');

const demoRequestSchema = new mongoose.Schema(
  {
    gymName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, default: '', trim: true },
    memberCount: { type: String, default: '<100' },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'payment_link_sent', 'approved', 'rejected'],
      default: 'pending',
    },
    paymentLink: { type: String, default: '' },
    customMessage: { type: String, default: '' },
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Settings', default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    tempPassword: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DemoRequest', demoRequestSchema);
