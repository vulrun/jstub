const crypto = require("node:crypto");
const jstub = require("../functions");

const cipherAlgorithms = require("../data/cipherAlgorithms.json");

module.exports = Cryptor;

function Cryptor(secret, options) {
  if (typeof secret !== "string" || secret.length <= 0) {
    throw new Error("Cryptor: secret must be a non-0-length string");
  }

  const defaults = {
    useUrlFriendlyBase64: true,
    algorithm: "chacha20-poly1305",
  };

  options = Object.assign(options || {}, defaults);
  options = Object.assign(options, {
    ...cipherAlgorithms.find((i) => i.algorithm.toLowerCase() === options.algorithm.toLowerCase()),
  });
  console.log("🚀 ~ Cryptor ~ options:", options);

  this.getKey = (secret) => {
    const key = crypto.createHash("sha256").update(secret).digest("hex");

    if (key.length > options.keyLength) {
      return key.slice(0, options.keyLength);
    } else if (key.length < options.keyLength) {
      return key.padEnd(options.keyLength - key.length, "0");
    }

    return key;
  };

  this.encrypt = (str) => {
    if (!str) throw new Error("value must not be null or undefined");
    str = typeof str === "string" ? str : JSON.stringify(str);

    const key = this.getKey(secret);
    const iv = crypto.randomBytes(options.ivLength);
    const cipher = crypto.createCipheriv(options.algorithm, key, iv);
    const enc = cipher.update(str, "utf8", "hex") + cipher.final("hex");
    const tag = options.hasAadSupport ? cipher.getAuthTag() : Buffer.from("");

    return jstub.base64UrlEncode([iv, tag, Buffer.from(enc, "hex")]);
  };

  this.decrypt = (b64) => {
    if (!b64 == null) throw new Error("value must not be null or undefined");

    const str = jstub.base64UrlDecode(b64, "buffer");
    const IV__POS = 0;
    const IV__LEN = options.ivLength;
    const TAG_POS = IV__POS + IV__LEN;
    const TAG_LEN = options.hasAadSupport ? options.authTagLength : 0;
    const ENC_POS = TAG_POS + TAG_LEN;

    let iv = str.slice(IV__POS, IV__POS + IV__LEN);
    let tag = str.slice(TAG_POS, TAG_POS + TAG_LEN);
    let enc = str.slice(ENC_POS);
    let key = this.getKey(secret);

    const decipher = crypto.createDecipheriv(options.algorithm, key, iv);
    if (options.hasAadSupport) {
      decipher.setAuthTag(tag);
    }

    return decipher.update(enc, "hex", "utf8") + decipher.final("utf8");
  };

  return this;
}
