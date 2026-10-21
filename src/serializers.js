const { paiseToRupeesString } = require("./money");

function moneyFields(record) {
  return {
    earnedAmount: paiseToRupeesString(record.earnedAmount),
    spentAmount: paiseToRupeesString(record.spentAmount),
    netAmount: paiseToRupeesString(record.netAmount),
    openingBalance: paiseToRupeesString(record.openingBalance),
    closingBalance: paiseToRupeesString(record.closingBalance),
    allocationBase: paiseToRupeesString(record.allocationBase),
    needsAmount: paiseToRupeesString(record.needsAmount),
    wantsAmount: paiseToRupeesString(record.wantsAmount),
    savingsAmount: paiseToRupeesString(record.savingsAmount),
    emergencyAmount: paiseToRupeesString(record.emergencyAmount),
    carriedDeficit: paiseToRupeesString(Math.min(0, record.closingBalance)),
  };
}

function serializeRecord(record) {
  const plain = typeof record.toObject === "function" ? record.toObject() : record;
  return {
    id: String(plain._id || plain.id || ""),
    date: plain.date,
    ...moneyFields(plain),
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

function serializeGoal(goal) {
  if (!goal) {
    return null;
  }
  const plain = typeof goal.toObject === "function" ? goal.toObject() : goal;
  return {
    id: String(plain._id || plain.id || ""),
    month: plain.month,
    targetAmount: paiseToRupeesString(plain.targetAmount),
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

module.exports = { serializeRecord, serializeGoal, moneyFields };
