const crypto = require("node:crypto");

module.exports = {
  md5,
  sha256,
  hexEncode,
  hexDecode,
  base64Encode,
  base64Decode,
  base64UrlEncode,
  base64UrlDecode,
};

function md5(str) {
  return crypto.createHash("md5").update(str).digest("hex");
}
function sha256(val) {
  return crypto.createHash("sha256").update(val).digest("hex");
}
function hexEncode(val) {
  return Buffer.from(String(val), "utf8").toString("hex");
}
function hexDecode(val) {
  return Buffer.from(String(val), "hex").toString("utf8");
}
function base64Encode(val) {
  return Buffer.from(String(val), "utf8").toString("base64");
}
function base64Decode(val) {
  return Buffer.from(String(val), "base64").toString("utf8");
}

function base64UrlEncode(input, encoding) {
  // input type to buffer
  if (typeof input === "string") {
    input = Buffer.from(input, encoding);
  } else if (Array.isArray(input)) {
    input = Buffer.concat(input);
  }

  if (!Buffer.isBuffer(input)) throw new Error("base64UrlEncode: Invalid Input");

  return input
    .toString("base64")
    .replace(/\+/g, "-") // Replace '+' with '-'
    .replace(/\//g, "_") // Replace '/' with '_'
    .replace(/=+$/, ""); // Remove trailing '='
}

function base64UrlDecode(input, encoding) {
  let base64 = input
    .replace(/-/g, "+") // Replace '-' with '+'
    .replace(/_/g, "/"); // Replace '_' with '/'

  // Pad with '=' to make the length of the string a multiple of 4
  switch (base64.length % 4) {
    case 1:
      base64 += "===";
      break;
    case 2:
      base64 += "==";
      break;
    case 3:
      base64 += "=";
      break;
  }

  const buffered = Buffer.from(base64, "base64");

  if (encoding === "buffer") return buffered;
  if (encoding === "json") return JSON.stringify(buffered);

  return buffered.toString(encoding);
}
