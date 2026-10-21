const DailyRecord = require("../models/DailyRecord");
const MonthlyGoal = require("../models/MonthlyGoal");
const { config } = require("../config");
const { paiseToRupeesString } = require("../money");
const { monthOf, todayInTimezone, normalizeMonth } = require("../dates");
const { currentCarriedDeficit } = require("../accounting");
const { listRecordsForMonth } = require("./recordService");
const { serializeRecord, serializeGoal } = require("../serializers");

function buildGoalProgress(goal, monthGrossEarnings) {
  if (!goal || goal.targetAmount <= 0) {
    return {
      hasGoal: Boolean(goal),
      targetAmount: goal ? paiseToRupeesString(goal.targetAmount) : null,
      monthGrossEarnings: paiseToRupeesString(monthGrossEarnings),
      progressPercent: null,
      remainingToGoal: goal ? paiseToRupeesString(goal.targetAmount) : null,
      prompt: "Set a monthly earning goal to track progress.",
    };
  }

  const progressPercent = Number(
    ((monthGrossEarnings / goal.targetAmount) * 100).toFixed(2)
  );
  const remainingToGoal = Math.max(0, goal.targetAmount - monthGrossEarnings);

  return {
    hasGoal: true,
    targetAmount: paiseToRupeesString(goal.targetAmount),
    monthGrossEarnings: paiseToRupeesString(monthGrossEarnings),
    progressPercent,
    remainingToGoal: paiseToRupeesString(remainingToGoal),
    prompt: null,
  };
}

async function getDashboard(monthInput) {
  const month = normalizeMonth(monthInput);
  const today = todayInTimezone(config.timezone);
  const isCurrentMonth = month === monthOf(today);

  const records = await listRecordsForMonth(month);
  const includedRecords = isCurrentMonth
    ? records.filter((record) => record.date <= today)
    : records;

  const totals = includedRecords.reduce(
    (acc, record) => {
      acc.earned += record.earnedAmount;
      acc.spent += record.spentAmount;
      acc.needs += record.needsAmount;
      acc.wants += record.wantsAmount;
      acc.savings += record.savingsAmount;
      acc.emergency += record.emergencyAmount;
      acc.allocationBase += record.allocationBase;
      return acc;
    },
    {
      earned: 0,
      spent: 0,
      needs: 0,
      wants: 0,
      savings: 0,
      emergency: 0,
      allocationBase: 0,
    }
  );

  const netAmount = totals.earned - totals.spent;
  const asOfDate = isCurrentMonth ? today : `${month}-31`;
  const carriedDeficitPaise = currentCarriedDeficit(includedRecords, asOfDate);
  const goal = await MonthlyGoal.findOne({ month });

  return {
    month,
    today,
    isCurrentMonth,
    accountingPeriod: config.accountingPeriod,
    totals: {
      earned: paiseToRupeesString(totals.earned),
      spent: paiseToRupeesString(totals.spent),
      netAmount: paiseToRupeesString(netAmount),
      allocationBase: paiseToRupeesString(totals.allocationBase),
      carriedDeficit: paiseToRupeesString(carriedDeficitPaise),
      hasDeficit: carriedDeficitPaise < 0,
    },
    allocations: {
      needs: paiseToRupeesString(totals.needs),
      wants: paiseToRupeesString(totals.wants),
      savings: paiseToRupeesString(totals.savings),
      emergency: paiseToRupeesString(totals.emergency),
    },
    labels: {
      netAmount:
        "Monthly net is total earned minus total spent. It is not necessarily cash on hand.",
      allocationBase:
        "Planned allocations use the positive balance remaining after recovering any carried deficit.",
      carriedDeficit:
        carriedDeficitPaise < 0
          ? "A deficit is being carried to the next recorded day in this period."
          : "No carried deficit right now.",
    },
    goal: buildGoalProgress(goal, totals.earned),
    recordCount: includedRecords.length,
  };
}

async function getReports(monthInput) {
  const dashboard = await getDashboard(monthInput);
  const records = await listRecordsForMonth(dashboard.month);
  return {
    ...dashboard,
    records: records.map(serializeRecord),
    goalRecord: serializeGoal(await MonthlyGoal.findOne({ month: dashboard.month })),
  };
}

module.exports = { getDashboard, getReports, buildGoalProgress };
