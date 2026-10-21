const DailyRecord = require("../models/DailyRecord");
const { config } = require("../config");
const { rupeesToPaise } = require("../money");
const { normalizeDate, monthOf, compareDates } = require("../dates");
const {
  getAccountingPeriodStart,
  openingFromPreviousClose,
  recalculateChronological,
} = require("../accounting");

async function findOpeningBalance(date) {
  const periodStart = getAccountingPeriodStart(date, config.accountingPeriod);
  const previous = await DailyRecord.findOne({
    date: { $gte: periodStart, $lt: date },
  })
    .sort({ date: -1 })
    .lean();

  if (!previous) {
    return 0;
  }
  return openingFromPreviousClose(previous.closingBalance);
}

async function persistCalculatedRecords(records) {
  for (const record of records) {
    await DailyRecord.updateOne(
      { date: record.date },
      {
        $set: {
          earnedAmount: record.earnedAmount,
          spentAmount: record.spentAmount,
          netAmount: record.netAmount,
          openingBalance: record.openingBalance,
          closingBalance: record.closingBalance,
          allocationBase: record.allocationBase,
          needsAmount: record.needsAmount,
          wantsAmount: record.wantsAmount,
          savingsAmount: record.savingsAmount,
          emergencyAmount: record.emergencyAmount,
        },
      }
    );
  }
}

async function recalculateFromDate(fromDate) {
  const periodPrefix =
    config.accountingPeriod === "month" ? monthOf(fromDate) : null;

  const laterRecords = await DailyRecord.find({
    date: { $gte: fromDate, ...(periodPrefix ? { $lte: `${periodPrefix}-31` } : {}) },
  })
    .sort({ date: 1 })
    .lean();

  if (laterRecords.length === 0) {
    return;
  }

  const openingBalance = await findOpeningBalance(laterRecords[0].date);
  const calculated = recalculateChronological(laterRecords, openingBalance);
  await persistCalculatedRecords(calculated);
}

function parseAmounts(body) {
  return {
    earnedAmount: rupeesToPaise(body.earnedAmount),
    spentAmount: rupeesToPaise(body.spentAmount),
  };
}

async function upsertRecord(dateInput, body) {
  const date = normalizeDate(dateInput);
  const { earnedAmount, spentAmount } = parseAmounts(body);
  const openingBalance = await findOpeningBalance(date);
  const [calculated] = recalculateChronological(
    [{ date, earnedAmount, spentAmount }],
    openingBalance
  );

  const saved = await DailyRecord.findOneAndUpdate(
    { date },
    {
      $set: {
        date,
        earnedAmount: calculated.earnedAmount,
        spentAmount: calculated.spentAmount,
        netAmount: calculated.netAmount,
        openingBalance: calculated.openingBalance,
        closingBalance: calculated.closingBalance,
        allocationBase: calculated.allocationBase,
        needsAmount: calculated.needsAmount,
        wantsAmount: calculated.wantsAmount,
        savingsAmount: calculated.savingsAmount,
        emergencyAmount: calculated.emergencyAmount,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await recalculateFromDate(date);
  return DailyRecord.findOne({ date });
}

async function getRecord(dateInput) {
  const date = normalizeDate(dateInput);
  return DailyRecord.findOne({ date });
}

async function listRecordsForMonth(month) {
  return DailyRecord.find({
    date: { $gte: `${month}-01`, $lte: `${month}-31` },
  }).sort({ date: 1 });
}

async function deleteRecord(dateInput) {
  const date = normalizeDate(dateInput);
  const existing = await DailyRecord.findOne({ date });
  if (!existing) {
    const error = new Error("No record exists for this date.");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  await DailyRecord.deleteOne({ date });
  await recalculateFromDate(date);
  return existing;
}

module.exports = {
  upsertRecord,
  getRecord,
  listRecordsForMonth,
  deleteRecord,
  recalculateFromDate,
  findOpeningBalance,
  parseAmounts,
  compareDates,
};
