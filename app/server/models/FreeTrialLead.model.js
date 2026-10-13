const mongoose = require('mongoose');

const freeTrialLeadSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'contacted'],
      default: 'pending',
    },
    source: {
      type: String,
      default: 'landing_cta',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FreeTrialLead', freeTrialLeadSchema);
