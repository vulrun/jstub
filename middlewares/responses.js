module.exports = responses;

function responses(req, res, next) {
  res.success = (message = "", result = {}) => {
    message = message || "OK";
    result = result || {};

    return res.status(200).json({
      success: true,
      message: message,
      status: 200,
      result: result,
    });
  };

  res.error = (error, status) => {
    error = error || {};
    status = status || error?.status || 400;

    return res.status(status).json({
      message: _errorMessage(error),
      success: false,
      status: status,
      result: error,
    });
  };

  next();
  return;
}

function _errorMessage(error) {
  if (typeof error?.message === "string") return error?.message;
  if (typeof error === "string") return error;

  return "SOMETHING_WENT_WRONG";
}
