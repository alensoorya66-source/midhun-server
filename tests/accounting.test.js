const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  calculateDay,
  recalculateChronological,
  currentCarriedDeficit,
  getAccountingPeriodStart,
  openingFromPreviousClose,
} = require("../src/accounting");

describe("accounting engine", () => {
  it("allocates a positive closing balance and does not carry surplus cash", () => {
    const day = calculateDay(0, 100000, 0);
    assert.equal(day.closingBalance, 100000);
    assert.equal(day.allocationBase, 100000);
    assert.equal(day.needsAmount, 30000);
    assert.equal(day.wantsAmount, 20000);
    assert.equal(day.savingsAmount, 30000);
    assert.equal(day.emergencyAmount, 20000);
    assert.equal(openingFromPreviousClose(day.closingBalance), 0);
  });

  it("sets allocations to zero and carries a deficit", () => {
    const day = calculateDay(0, 10000, 25000);
    assert.equal(day.closingBalance, -15000);
    assert.equal(day.allocationBase, 0);
    assert.equal(day.needsAmount, 0);
    assert.equal(openingFromPreviousClose(day.closingBalance), -15000);
  });

  it("uses later earnings to offset a carried deficit before allocating", () => {
    const calculated = recalculateChronological(
      [
        { date: "2026-10-01", earnedAmount: 10000, spentAmount: 40000 },
        { date: "2026-10-03", earnedAmount: 50000, spentAmount: 5000 },
      ],
      0
    );

    assert.equal(calculated[0].closingBalance, -30000);
    assert.equal(calculated[0].allocationBase, 0);
    assert.equal(calculated[1].openingBalance, -30000);
    assert.equal(calculated[1].closingBalance, 15000);
    assert.equal(calculated[1].allocationBase, 15000);
    assert.equal(calculated[1].needsAmount, 4500);
  });

  it("skips missing dates without inventing zero records", () => {
    const calculated = recalculateChronological(
      [
        { date: "2026-10-01", earnedAmount: 0, spentAmount: 2000 },
        { date: "2026-10-05", earnedAmount: 2000, spentAmount: 0 },
      ],
      0
    );
    assert.equal(calculated.length, 2);
    assert.equal(calculated[1].date, "2026-10-05");
    assert.equal(calculated[1].openingBalance, -2000);
    assert.equal(calculated[1].closingBalance, 0);
  });

  it("recalculates later days after an earlier edit", () => {
    const original = recalculateChronological(
      [
        { date: "2026-10-01", earnedAmount: 0, spentAmount: 5000 },
        { date: "2026-10-02", earnedAmount: 8000, spentAmount: 0 },
      ],
      0
    );
    assert.equal(original[1].openingBalance, -5000);

    const edited = recalculateChronological(
      [
        { date: "2026-10-01", earnedAmount: 5000, spentAmount: 0 },
        { date: "2026-10-02", earnedAmount: 8000, spentAmount: 0 },
      ],
      0
    );
    assert.equal(edited[1].openingBalance, 0);
    assert.equal(edited[1].allocationBase, 8000);
  });

  it("resets the period start on the first of the month", () => {
    assert.equal(getAccountingPeriodStart("2026-10-21", "month"), "2026-10-01");
    assert.equal(getAccountingPeriodStart("2026-10-21", "continuous"), "0000-01-01");
  });

  it("reports the current carried deficit as of a date", () => {
    const records = recalculateChronological(
      [
        { date: "2026-10-01", earnedAmount: 0, spentAmount: 900 },
        { date: "2026-10-02", earnedAmount: 100, spentAmount: 0 },
      ],
      0
    );
    assert.equal(currentCarriedDeficit(records, "2026-10-01"), -900);
    assert.equal(currentCarriedDeficit(records, "2026-10-02"), -800);
  });
});
