let HttpsProxyAgent;
let httpsAgentOptions = {};

const _axios = require("axios");
const axios = _axios.create();

axios.interceptors.request.use(requestHandler, requestErrorHandler);
axios.interceptors.response.use(responseHandler, responseErrorHandler);

module.exports = axios;
module.exports.createInstance = () => axios;
module.exports.buildProxyUrl = buildProxyUrl;
module.exports.fixHttpsProxyAgent = fixHttpsProxyAgent;

function requestHandler(config) {
  const isHttps = config.url.startsWith("https://");

  if (config?.proxy && isHttps && HttpsProxyAgent?.name === "HttpsProxyAgent") {
    config.httpsAgent = new HttpsProxyAgent(buildProxyUrl(config?.proxy), { ...httpsAgentOptions, ...config?.httpsAgentOptions });
    config.proxy = false;
  }

  config.headers = lowerCaseProperty(config.headers);
  if (!config?.headers["content-type"]) {
    config.headers["content-type"] = "application/json";
  }
  if (!config?.headers["user-agent"]) {
    config.headers["user-agent"] = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36";
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
  if (!isAxiosError(error)) throw new Error(error?.message);

  if (error.code === "ERR_CANCELED") throw new Error("API_CONNECTION_CANCELED");
  if (error.code === "ERR_NETWORK") throw new Error("API_CONNECTION_PROBLEMS");
  if (error.code === "ECONNRESET") throw new Error("API_REQUEST_FAILED");
  if (error.code === "ETIMEDOUT") throw new Error("API_REQUEST_TIMEOUT");

  if (error?.response) {
    switch (error?.response?.status) {
      case 401:
        // redirect user to login
        throw new Error(`UNAUTHORIZED_API_REQUEST`);

      case 403:
        // redirect user to login
        throw new Error(`FORBIDDEN_API_REQUEST`);

      case 404:
        throw new Error(`INVALID_API_REQUEST`);

      default:
        throw new Error(error?.response?.data?.message || error?.response?.data);
    }
  } else if (error?.request) {
    // request was made but no response was received,
    // error.request is an instance of XMLHttpRequest in the browser
    // and an instance of http.ClientRequest in Node.js
  }
}

function isAxiosError(error) {
  return _axios.isAxiosError(error) || error?.name === "AxiosError";
}

function lowerCaseProperty(obj) {
  const newObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key.toLowerCase()] = obj[key];
    }
  }
  return newObj;
}

function isPackageInstalled(packageName) {
  try {
    require.resolve(packageName);
    return true;
  } catch (error) {
    if (error?.code === "MODULE_NOT_FOUND") {
      return false;
    }
    throw error;
  }
}

function fixHttpsProxyAgent(agentOptions) {
  if (!isPackageInstalled("https-proxy-agent")) {
    return console.log("~ Axios ~", "https-proxy-agent not found, hit: npm install https-proxy-agent");
  }
  httpsAgentOptions = { ...agentOptions };
  HttpsProxyAgent = require("https-proxy-agent")?.HttpsProxyAgent;
}

function buildProxyUrl(proxy) {
  if (typeof proxy === "string") return proxy;

  // Trim off the brackets from IPv6 addresses
  const host = String(proxy?.host || proxy?.hostname).replace(/^\[|\]$/g, "");
  const port = proxy?.port ? ":" + proxy?.port : "";
  if (!host) return null;

  if (!proxy?.auth) {
    return `http://${host}${port}`;
  }

  if (typeof proxy?.auth === "string") {
    return `http://${proxy?.auth}@${host}${port}`;
  }

  const user = String(proxy?.auth?.user || proxy?.auth?.username || "").trim();
  const pass = String(proxy?.auth?.pass || proxy?.auth?.password || "").trim();
  if (!user) return `http://${host}${port}`;

  const proxyAuth = [user, pass].filter(Boolean).join(":");
  return `http://${proxyAuth}@${host}${port}`;
}
