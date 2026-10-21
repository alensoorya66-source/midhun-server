const express = require("express");
const { asyncHandler } = require("../middleware/errorHandler");
const { getDashboard } = require("../services/dashboardService");
const { monthOf, todayInTimezone } = require("../dates");
const { config } = require("../config");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const month = req.query.month || monthOf(todayInTimezone(config.timezone));
    const dashboard = await getDashboard(month);
    res.json(dashboard);
  })
);

module.exports = router;
