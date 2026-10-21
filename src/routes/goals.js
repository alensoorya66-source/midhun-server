const express = require("express");
const MonthlyGoal = require("../models/MonthlyGoal");
const { asyncHandler } = require("../middleware/errorHandler");
const { normalizeMonth } = require("../dates");
const { rupeesToPaise } = require("../money");
const { serializeGoal } = require("../serializers");

const router = express.Router();

router.get(
  "/:month",
  asyncHandler(async (req, res) => {
    const month = normalizeMonth(req.params.month);
    const goal = await MonthlyGoal.findOne({ month });
    res.json({ month, goal: serializeGoal(goal) });
  })
);

router.put(
  "/:month",
  asyncHandler(async (req, res) => {
    const month = normalizeMonth(req.params.month);
    const targetAmount = rupeesToPaise(req.body.targetAmount);

    if (targetAmount <= 0) {
      const error = new Error("Set a positive earning target to track progress.");
      error.status = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    const goal = await MonthlyGoal.findOneAndUpdate(
      { month },
      { $set: { month, targetAmount } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ goal: serializeGoal(goal) });
  })
);

module.exports = router;
