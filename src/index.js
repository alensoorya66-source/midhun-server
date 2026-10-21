const express = require("express");
const cors = require("cors");
const { config } = require("./config");
const { connectDb } = require("./db");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const recordsRouter = require("./routes/records");
const dashboardRouter = require("./routes/dashboard");
const goalsRouter = require("./routes/goals");
const reportsRouter = require("./routes/reports");

const app = express();

app.use(
  cors({
    origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(","),
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    accountingPeriod: config.accountingPeriod,
    timezone: config.timezone,
  });
});

app.use("/api/records", recordsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/goals", goalsRouter);
app.use("/api/reports", reportsRouter);

app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDb();
  app.listen(config.port, () => {
    console.log(`Finance API listening on http://localhost:${config.port}`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}

module.exports = { app, start };
