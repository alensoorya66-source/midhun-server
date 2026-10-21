const express = require("express");
const { asyncHandler } = require("../middleware/errorHandler");
const { getReports } = require("../services/dashboardService");
const { monthOf, todayInTimezone } = require("../dates");
const { config } = require("../config");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const month = req.query.month || monthOf(todayInTimezone(config.timezone));
    const reports = await getReports(month);
    res.json(reports);
  })
);

module.exports = router;
