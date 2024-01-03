const https = require("https");
const _axios = require("axios");
const axios = _axios.create();

axios.interceptors.request.use(requestHandler, requestErrorHandler);
axios.interceptors.response.use(responseHandler, responseErrorHandler);

module.exports = axios;

function isAxiosError(error) {
  return _axios.isAxiosError(error) || error?.name === "AxiosError";
}

function requestHandler(config) {
  if (!config?.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }
  if (!config?.headers["User-Agent"]) {
    config.headers["User-Agent"] = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36";
  }
  if (process.env?.NODE_ENV?.startsWith("dev")) {
    config.httpsAgent = new https.Agent({ rejectUnauthorized: false });
  }
  return config;
}

function requestErrorHandler(error) {
  return Promise.reject(error);
}

function responseHandler(response) {
  if (response?.config?.raw) {
    return response;
  }

  if (/20[0-8]/.test("" + response?.status)) {
    const data = response?.data;
    if (!data) throw new Error("NO_API_DATA");

    return data;
  }
  throw new Error("INVALID_API_STATUS_CODE");
}

function responseErrorHandler(response) {
  if (response?.config?.raw) {
    return response;
  }

  return httpErrorHandler(response);
}

function httpErrorHandler(error) {
  if (error === null) throw new Error("UNRECOVERABLE_ERROR");

  if (isAxiosError(error)) {
    const { config, request, response } = error;

    if (error.code === "ERR_NETWORK") {
      throw new Error("API_CONNECTION_PROBLEMS");
    } else if (error.code === "ERR_CANCELED") {
      throw new Error("API_CONNECTION_CANCELED");
    } else if (error.code === "ECONNRESET") {
      throw new Error("API_REQUEST_FAILED");
    } else if (error.code === "ETIMEDOUT") {
      throw new Error("API_REQUEST_TIMEOUT");
    }
    if (response) {
      const statusCode = response?.status;
      if (statusCode === 404) {
        throw new Error(`INVALID_API_REQUEST`);
      } else if (statusCode === 401) {
        throw new Error("UNAUTHORIZED_API_REQUEST");
        // redirect user to login
      }
      return error?.response?.data;
    } else if (request) {
      //The request was made but no response was received, `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in Node.js
    }
  }
  throw new Error(error.message);
}
