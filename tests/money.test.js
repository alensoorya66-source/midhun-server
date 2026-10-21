const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  rupeesToPaise,
  paiseToRupeesString,
  allocate,
} = require("../src/money");

describe("money", () => {
  it("converts rupees to paise without floating-point drift", () => {
    assert.equal(rupeesToPaise("10.10"), 1010);
    assert.equal(rupeesToPaise("0"), 0);
    assert.equal(rupeesToPaise("0.01"), 1);
    assert.equal(paiseToRupeesString(1010), "10.10");
    assert.equal(paiseToRupeesString(-250), "-2.50");
  });

  it("rejects negative, malformed, and huge amounts", () => {
    assert.throws(() => rupeesToPaise("-1"), /non-negative/);
    assert.throws(() => rupeesToPaise("abc"), /non-negative/);
    assert.throws(() => rupeesToPaise("1.234"), /2 decimal/);
    assert.throws(() => rupeesToPaise("100000001"), /unreasonably large/);
  });

  it("allocates 30/20/30/20 and keeps the remainder in emergency", () => {
    const split = allocate(100);
    assert.equal(split.needsAmount, 30);
    assert.equal(split.wantsAmount, 20);
    assert.equal(split.savingsAmount, 30);
    assert.equal(split.emergencyAmount, 20);
    assert.equal(
      split.needsAmount + split.wantsAmount + split.savingsAmount + split.emergencyAmount,
      100
    );
  });

  it("keeps category totals equal to the allocation base after rounding", () => {
    for (const base of [1, 3, 7, 33, 101, 999, 12345]) {
      const split = allocate(base);
      const sum =
        split.needsAmount +
        split.wantsAmount +
        split.savingsAmount +
        split.emergencyAmount;
      assert.equal(sum, base);
      assert.ok(split.emergencyAmount >= 0);
    }
  });
});
