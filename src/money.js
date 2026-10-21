const MAX_RUPEES = 100_000_000; // 10 crore — reject unreasonable amounts
const PAISE_PER_RUPEE = 100;

function rupeesToPaise(value) {
  if (value === null || value === undefined || value === "") {
    const error = new Error("Amount is required.");
    error.status = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  if (typeof value === "number" && !Number.isFinite(value)) {
    const error = new Error("Amount must be a valid number.");
    error.status = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const text = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) {
    const error = new Error(
      "Amount must be a non-negative number with at most 2 decimal places."
    );
    error.status = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const [rupeesPart, paisePart = ""] = text.split(".");
  const rupees = Number(rupeesPart);
  if (rupees > MAX_RUPEES) {
    const error = new Error("Amount is unreasonably large.");
    error.status = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const paise = Number((paisePart + "00").slice(0, 2));
  return rupees * PAISE_PER_RUPEE + paise;
}

function paiseToRupeesString(paise) {
  const sign = paise < 0 ? "-" : "";
  const absolute = Math.abs(paise);
  const rupees = Math.floor(absolute / PAISE_PER_RUPEE);
  const remainder = String(absolute % PAISE_PER_RUPEE).padStart(2, "0");
  return `${sign}${rupees}.${remainder}`;
}

function paiseToRupeesNumber(paise) {
  return Number(paiseToRupeesString(paise));
}

/**
 * Split allocationBase paise into 30 / 20 / 30 / 20.
 * Remainder after rounding the first three categories goes to Emergency.
 */
function allocate(allocationBasePaise) {
  if (allocationBasePaise <= 0) {
    return {
      needsAmount: 0,
      wantsAmount: 0,
      savingsAmount: 0,
      emergencyAmount: 0,
    };
  }

  const needsAmount = Math.round((allocationBasePaise * 30) / 100);
  const wantsAmount = Math.round((allocationBasePaise * 20) / 100);
  const savingsAmount = Math.round((allocationBasePaise * 30) / 100);
  const emergencyAmount =
    allocationBasePaise - needsAmount - wantsAmount - savingsAmount;

  return { needsAmount, wantsAmount, savingsAmount, emergencyAmount };
}

module.exports = {
  MAX_RUPEES,
  PAISE_PER_RUPEE,
  rupeesToPaise,
  paiseToRupeesString,
  paiseToRupeesNumber,
  allocate,
};
