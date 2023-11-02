module.exports = () => responses;

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

  res.error = (status = 400, error) => {
    status = status || 400;
    error = error || {};

    return res.status(status).json({
      message: error?.message || error || "SOMETHING_WENT_WRONG",
      success: false,
      status: status,
      result: error,
    });
  };

  next();
  return;
}
