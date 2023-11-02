const http = require("http");
const https = require("https");

/**
 * @desc complete bare url fetch function
 *
 * @usage POST
 * fetch_(URL, OPTIONS, DATA, CALLBACK)
 * fetch_(URL, OPTIONS, DATA)
 *
 * @usage GET
 * fetch_(URL, OPTIONS, CALLBACK)
 * fetch_(URL, OPTIONS)
 * fetch_(URL, CALLBACK)
 * fetch_(URL)
 */

module.exports = fetch;

function fetch() {
  let url, opts, post, cb;
  if (arguments.length === 4) {
    url = arguments[0];
    opts = arguments[1];
    post = arguments[2];
    cb = arguments[3];
  } else if (arguments.length === 3) {
    url = arguments[0];
    opts = arguments[1];
    if (typeof arguments[2] === "function") cb = arguments[2];
    else {
      post = arguments[2];
    }
  } else if (arguments.length === 2) {
    url = arguments[0];
    if (typeof arguments[1] === "function") cb = arguments[1];
    else {
      opts = arguments[1];
    }
  } else {
    url = arguments[0];
  }

  const client = String(url).indexOf("https") === 0 ? https : http;
  const headers = {};

  if (typeof post === "string") {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    headers["Content-Length"] = post.length || 0;
  } else if (typeof post === "object") {
    post = JSON.stringify(post);
    headers["Content-Type"] = "application/json";
    headers["Content-Length"] = post.length || 0;
  } else {
    post = undefined;
  }

  const options = {
    method: post ? "POST" : "GET",
    timeout: 15e3,
    headers: Object.assign({}, headers, opts?.headers),
  };

  // console.log({ url, opts, post, cb, options });
  const promise = new Promise((resolve, reject) => {
    const req = client.request(url, options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({ data, headers: res.headers, status: res.statusCode });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });

    if (post) req.write(post);
    req.end();
  });

  if (typeof cb != "function") return promise;
  promise.then((res) => cb(null, res)).catch((err) => cb(err));
}
