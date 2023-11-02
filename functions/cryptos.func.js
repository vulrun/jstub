const crypto = require("crypto");

module.exports = {
  md5,
  sha256,
  hexEncode,
  hexDecode,
  base64Encode,
  base64Decode,
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
