require("dotenv").config();

const ACCOUNTING_PERIODS = new Set(["month", "continuous"]);

function readAccountingPeriod() {
  const value = (process.env.ACCOUNTING_PERIOD || "month").trim().toLowerCase();
  if (!ACCOUNTING_PERIODS.has(value)) {
    throw new Error(
      `ACCOUNTING_PERIOD must be "month" or "continuous", got "${process.env.ACCOUNTING_PERIOD}"`
    );
  }
  return value;
}

const config = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI ,
  corsOrigin: process.env.CORS_ORIGIN || "*",
  accountingPeriod: readAccountingPeriod(),
  timezone: process.env.APP_TIMEZONE || "Asia/Kolkata",
};

module.exports = { config, ACCOUNTING_PERIODS };
