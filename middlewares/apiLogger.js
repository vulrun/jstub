const functions = require("../functions");

module.exports = apiLogger;

function apiLogger(cb) {
  function getIp(req) {
    return req.ip || req._remoteAddress || (req.connection && req.connection.remoteAddress) || undefined;
  }
  function isHeadersSent(res) {
    return typeof res.headersSent !== "boolean" ? Boolean(res._header) : res.headersSent;
  }
  function recordStartTime() {
    this._startAt = process.hrtime();
    this._startTime = new Date();
  }
  function calcRespTime(req, res) {
    // missing request/response start time
    if (!req._startAt || !res._startAt) return;
    // calculate diff
    const ms = (res._startAt[0] - req._startAt[0]) * 1e3 + (res._startAt[1] - req._startAt[1]) * 1e-6;
    // return truncated value
    return ms.toFixed(3);
  }

  return function logger(req, res, next) {
    // request data
    req._startAt = undefined;
    req._startTime = undefined;
    req._remoteAddress = getIp(req);

    // response data
    res._startAt = undefined;
    res._startTime = undefined;

    // saving the response
    let responseData = "";
    const responseEnd = res.end;
    res.end = function (chunk, encoding) {
      responseData += chunk;
      responseEnd.call(res, chunk, encoding);
    };

    // record request time
    recordStartTime.call(req);

    res.on("finish", function () {
      // record response time
      recordStartTime.call(res);

      cb({
        method: req.method,
        url_host: `${req.protocol}://` + req.get("host"),
        url_path: req.originalUrl || req.url,
        raw_req: { HEADERS: req.headers, PARAMS: req.params, QUERY: req.query, BODY: req.body },
        raw_res: { HEADERS: res.getHeaders() || {}, RESULT: functions.safeJsonParse(responseData) || responseData },
        resp_time: calcRespTime(req, res),
        resp_code: isHeadersSent(res) ? String(res.statusCode) : null,
        ip_address: req._remoteAddress,
        logged_at: new Date().toISOString(),
      });
    });

    next();
  };
}
