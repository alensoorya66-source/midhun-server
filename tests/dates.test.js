const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { normalizeDate, normalizeMonth, monthOf } = require("../src/dates");

describe("dates", () => {
  it("normalizes valid calendar dates", () => {
    assert.equal(normalizeDate("2026-10-21"), "2026-10-21");
    assert.equal(monthOf("2026-10-21"), "2026-10");
    assert.equal(normalizeMonth("2026-10-21"), "2026-10");
  });

  it("rejects impossible dates", () => {
    assert.throws(() => normalizeDate("2026-02-31"), /real calendar date/);
    assert.throws(() => normalizeDate("21-10-2026"), /YYYY-MM-DD/);
  });
});
