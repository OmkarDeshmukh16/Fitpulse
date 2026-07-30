const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Settings', required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD for easy grouping
    checkInTime: { type: Date, required: true },
    checkOutTime: { type: Date, default: null },
    duration: { type: Number, default: null }, // minutes
    method: { type: String, enum: ['qr', 'manual'], default: 'manual' },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

attendanceSchema.index({ gymId: 1, date: 1 });
attendanceSchema.index({ gymId: 1, memberId: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
