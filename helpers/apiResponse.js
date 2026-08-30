const success = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

const failure = (res, statusCode, message, details = undefined) => {
  const payload = {
    success: false,
    message,
  };

  if (details !== undefined) {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  success,
  failure,
};
