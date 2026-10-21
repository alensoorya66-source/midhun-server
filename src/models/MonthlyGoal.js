const mongoose = require("mongoose");

const monthlyGoalSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{4}-\d{2}$/,
    },
    targetAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MonthlyGoal", monthlyGoalSchema);
