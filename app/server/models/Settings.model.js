const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    gymName: { type: String, required: true, default: 'My Gym' },
    logo: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    website: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    currency: { type: String, default: 'INR' },
    currencySymbol: { type: String, default: '₹' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    receiptFooter: { type: String, default: 'Thank you for choosing us!' },
    isSetupComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
