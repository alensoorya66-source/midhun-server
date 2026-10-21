const express = require("express");
const { asyncHandler } = require("../middleware/errorHandler");
const {
  upsertRecord,
  getRecord,
  listRecordsForMonth,
  deleteRecord,
} = require("../services/recordService");
const { serializeRecord } = require("../serializers");
const { normalizeMonth, normalizeDate } = require("../dates");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const month = normalizeMonth(req.query.month);
    const records = await listRecordsForMonth(month);
    res.json({ month, records: records.map(serializeRecord) });
  })
);

router.get(
  "/:date",
  asyncHandler(async (req, res) => {
    const date = normalizeDate(req.params.date);
    const record = await getRecord(date);
    if (!record) {
      return res.status(200).json({ date, record: null });
    }
    res.json({ date, record: serializeRecord(record) });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const date = normalizeDate(req.body.date);
    const record = await upsertRecord(date, req.body);
    res.status(200).json({ record: serializeRecord(record) });
  })
);

router.put(
  "/:date",
  asyncHandler(async (req, res) => {
    const date = normalizeDate(req.params.date);
    const record = await upsertRecord(date, req.body);
    res.json({ record: serializeRecord(record) });
  })
);

router.delete(
  "/:date",
  asyncHandler(async (req, res) => {
    const date = normalizeDate(req.params.date);
    await deleteRecord(date);
    res.json({ deleted: true, date });
  })
);

module.exports = router;
