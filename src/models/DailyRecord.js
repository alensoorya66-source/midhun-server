const mongoose = require("mongoose");

const dailyRecordSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    earnedAmount: { type: Number, required: true, min: 0 },
    spentAmount: { type: Number, required: true, min: 0 },
    netAmount: { type: Number, required: true },
    openingBalance: { type: Number, required: true },
    closingBalance: { type: Number, required: true },
    allocationBase: { type: Number, required: true, min: 0 },
    needsAmount: { type: Number, required: true, min: 0 },
    wantsAmount: { type: Number, required: true, min: 0 },
    savingsAmount: { type: Number, required: true, min: 0 },
    emergencyAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DailyRecord", dailyRecordSchema);
