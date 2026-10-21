function notFound(_req, res) {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "The requested resource was not found.",
    },
  });
}

function errorHandler(err, _req, res, _next) {
  if (err.code === 11000) {
    return res.status(409).json({
      error: {
        code: "DUPLICATE",
        message: "A record already exists for this date or month.",
      },
    });
  }

  const status = err.status || 500;
  const code = err.code || (status === 500 ? "SERVER_ERROR" : "REQUEST_ERROR");
  const message =
    status === 500
      ? "Something went wrong. Please try again."
      : err.message || "Request could not be processed.";

  if (status === 500) {
    console.error(err);
  }

  return res.status(status).json({
    error: { code, message },
  });
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { notFound, errorHandler, asyncHandler };
