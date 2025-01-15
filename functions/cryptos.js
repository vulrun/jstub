const crypto = require("node:crypto");
// https://github.com/browserify/crypto-browserify/blob/master/example/bundle.js
module.exports = {
  md5,
  sha256,
  safeUuid4,
  hexEncode,
  hexDecode,
  base64Encode,
  base64Decode,
  base64UrlEncode,
  base64UrlDecode,
};

function md5(input) {
  if (typeof input !== "string") throw new Error("md5: invalid input");
  return crypto.createHash("md5").update(input).digest("hex");
}

function sha256(input) {
  if (typeof input !== "string") throw new Error("sha256: invalid input");
  return crypto.createHash("sha256").update(input).digest("hex");
}

function safeUuid4() {
  let rand = crypto.randomBytes(16);
  rand[6] = (rand[6] & 0x0f) | 0x40;
  rand[8] = (rand[8] & 0x3f) | 0x80;
  rand = rand.toString("hex").match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
  rand.shift();
  return rand.join("-");
}

function hexEncode(input, encoding) {
  // input type to buffer
  if (typeof input === "string") {
    input = Buffer.from(input, encoding || "utf8");
  } else if (Array.isArray(input)) {
    input = Buffer.concat(input);
  }

  if (!Buffer.isBuffer(input)) throw new Error("hexEncode: invalid input");

  return input.toString("hex");
}

function hexDecode(input, encoding) {
  if (typeof input !== "string") throw new Error("hexDecode: invalid input");

  const buffered = Buffer.from(input, "hex");

  // return based on encoding
  if (encoding === "buffer") return buffered;
  if (encoding === "json") return JSON.stringify(buffered);

  return buffered.toString(encoding || "utf8");
}

function base64Encode(input, encoding) {
  // input type to buffer
  if (typeof input === "string") {
    input = Buffer.from(input, encoding || "utf8");
  } else if (Array.isArray(input)) {
    input = Buffer.concat(input);
  }

  if (!Buffer.isBuffer(input)) throw new Error("base64Encode: invalid input");

  return input.toString("base64");
}

function base64Decode(input, encoding) {
  if (typeof input !== "string") throw new Error("base64Decode: invalid input");

  const buffered = Buffer.from(input, "base64");

  // return based on encoding
  if (encoding === "buffer") return buffered;
  if (encoding === "json") return JSON.stringify(buffered);

  return buffered.toString(encoding || "utf8");
}

function base64UrlEncode(input, encoding) {
  // input type to buffer
  if (typeof input === "string") {
    input = Buffer.from(input, encoding || "utf8");
  } else if (Array.isArray(input)) {
    input = Buffer.concat(input);
  }

  if (!Buffer.isBuffer(input)) throw new Error("base64UrlEncode: invalid input");

  return input
    .toString("base64")
    .replace(/\+/g, "-") // Replace '+' with '-'
    .replace(/\//g, "_") // Replace '/' with '_'
    .replace(/=+$/, ""); // Remove trailing '='
}

function base64UrlDecode(input, encoding) {
  if (typeof input !== "string") throw new Error("base64UrlDecode: invalid input");

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

  return buffered.toString(encoding || "utf8");
}
