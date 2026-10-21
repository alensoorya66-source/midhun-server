const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_PATTERN = /^\d{4}-\d{2}$/;

function isValidYmd(date) {
  if (!DATE_PATTERN.test(date)) {
    return false;
  }
  const [year, month, day] = date.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return (
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day
  );
}

function normalizeDate(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    const error = new Error("Date is required.");
    error.status = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const text = String(value).trim().slice(0, 10);
  if (!isValidYmd(text)) {
    const error = new Error("Date must be a real calendar date in YYYY-MM-DD format.");
    error.status = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }
  return text;
}

function normalizeMonth(value) {
  if (value === null || value === undefined || String(value).trim() === "") {
    const error = new Error("Month is required.");
    error.status = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  let text = String(value).trim();
  if (DATE_PATTERN.test(text)) {
    text = text.slice(0, 7);
  }
  if (!MONTH_PATTERN.test(text)) {
    const error = new Error("Month must be in YYYY-MM format.");
    error.status = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const [year, month] = text.split("-").map(Number);
  if (month < 1 || month > 12) {
    const error = new Error("Month must be between 01 and 12.");
    error.status = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;
}

function monthOf(date) {
  return normalizeDate(date).slice(0, 7);
}

function todayInTimezone(timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year").value;
  const month = parts.find((part) => part.type === "month").value;
  const day = parts.find((part) => part.type === "day").value;
  return `${year}-${month}-${day}`;
}

function previousMonth(month) {
  const normalized = normalizeMonth(month);
  const [year, monthNumber] = normalized.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 2, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function nextMonth(month) {
  const normalized = normalizeMonth(month);
  const [year, monthNumber] = normalized.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function compareDates(a, b) {
  if (a === b) {
    return 0;
  }
  return a < b ? -1 : 1;
}

module.exports = {
  DATE_PATTERN,
  MONTH_PATTERN,
  isValidYmd,
  normalizeDate,
  normalizeMonth,
  monthOf,
  todayInTimezone,
  previousMonth,
  nextMonth,
  compareDates,
};
