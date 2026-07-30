const mongoose = require('mongoose');

let invoiceCounter = 1;

const paymentSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Settings', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    membershipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership', default: null },
    invoiceNumber: { type: String, unique: true },
    amount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank_transfer', 'other'],
      required: true,
    },
    date: { type: Date, default: Date.now },
    transactionId: { type: String, default: '' },
    gstAmount: { type: Number, default: 0 },
    gstPercent: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['paid', 'partial', 'pending', 'refunded'],
      default: 'paid',
    },
    notes: { type: String, default: '' },
    receiptUrl: { type: String, default: '' },
    isRefunded: { type: Boolean, default: false },
    refundAmount: { type: Number, default: 0 },
    refundDate: { type: Date, default: null },
    refundReason: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-generate invoice number (Mongoose 8+ — no next() in async hooks)
paymentSchema.pre('save', async function () {
  if (this.isNew) {
    const count = await this.constructor.countDocuments({ gymId: this.gymId });
    const year = new Date().getFullYear();
    this.invoiceNumber = `FP-${year}-${String(count + 1).padStart(5, '0')}`;
    this.dueAmount = this.amount - this.paidAmount;
  }
});

paymentSchema.index({ gymId: 1, date: 1 });
paymentSchema.index({ gymId: 1, memberId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
