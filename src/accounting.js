const { allocate } = require("./money");
const { monthOf, compareDates } = require("./dates");

/**
 * Month-boundary deficit policy lives in one place.
 * - month: opening balance is 0 at the start of each calendar month
 * - continuous: deficit (negative close) carries into the next month
 *
 * Missing dates never create records. Carry the opening balance to the
 * next recorded date inside the same accounting period.
 */
function getAccountingPeriodStart(date, accountingPeriod) {
  if (accountingPeriod === "month") {
    return `${monthOf(date)}-01`;
  }
  return "0000-01-01";
}

function isInSamePeriod(date, periodStart, accountingPeriod) {
  if (accountingPeriod === "month") {
    return monthOf(date) === monthOf(periodStart);
  }
  return true;
}

function openingFromPreviousClose(previousClosingBalance) {
  if (previousClosingBalance === null || previousClosingBalance === undefined) {
    return 0;
  }
  // Surplus is allocated that day and is not carried as cash.
  return Math.min(0, previousClosingBalance);
}

function calculateDay(openingBalance, earnedAmount, spentAmount) {
  const netAmount = earnedAmount - spentAmount;
  const closingBalance = openingBalance + netAmount;
  const allocationBase = Math.max(0, closingBalance);
  const allocations = allocate(allocationBase);

  return {
    openingBalance,
    closingBalance,
    netAmount,
    allocationBase,
    ...allocations,
  };
}

function recalculateChronological(records, startingOpeningBalance = 0) {
  const sorted = [...records].sort((a, b) => compareDates(a.date, b.date));
  let openingBalance = startingOpeningBalance;
  const calculated = [];

  for (const record of sorted) {
    const derived = calculateDay(
      openingBalance,
      record.earnedAmount,
      record.spentAmount
    );
    calculated.push({
      ...record,
      ...derived,
    });
    openingBalance = openingFromPreviousClose(derived.closingBalance);
  }

  return calculated;
}

function currentCarriedDeficit(records, asOfDate) {
  const applicable = records
    .filter((record) => record.date <= asOfDate)
    .sort((a, b) => compareDates(a.date, b.date));

  if (applicable.length === 0) {
    return 0;
  }

  const last = applicable[applicable.length - 1];
  return Math.min(0, last.closingBalance);
}

module.exports = {
  getAccountingPeriodStart,
  isInSamePeriod,
  openingFromPreviousClose,
  calculateDay,
  recalculateChronological,
  currentCarriedDeficit,
};
