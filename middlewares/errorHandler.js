const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err.message || err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};

module.exports = errorHandler;
