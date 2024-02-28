const crypto = require("node:crypto");

module.exports = Cryptor;

function Cryptor(secret) {
  if (!secret || typeof secret !== "string") throw new Error("Cryptor: secret must be a non-0-length string");

  const ALGORITHM = "aes-256-gcm";
  const SLT_LEN = 64;
  const IV__LEN = 16;
  const TAG_POS = SLT_LEN + IV__LEN;
  const TAG_LEN = 16;
  const ENC_POS = TAG_POS + TAG_LEN;

  this.getKey = (secret, salt) => {
    return crypto.pbkdf2Sync(secret, salt, 100000, 32, "sha512");
  };

  this.encrypt = (val) => {
    val = typeof val === "string" ? val : JSON.stringify(val);
    if (!val) throw new Error("value must not be null or undefined");

    const iv = crypto.randomBytes(IV__LEN);
    const salt = crypto.randomBytes(SLT_LEN);
    const key = this.getKey(secret, salt);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const enc = Buffer.concat([cipher.update(val, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    return base64Encode([salt, iv, tag, enc], { esc: true });
  };

  this.decrypt = (b64) => {
    if (!b64 == null) throw new Error("value must not be null or undefined");

    const str = base64Decode(b64, { esc: true, str: false });

    const salt = str.slice(0, SLT_LEN);
    const iv = str.slice(SLT_LEN, SLT_LEN + IV__LEN);
    const tag = str.slice(TAG_POS, TAG_POS + TAG_LEN);
    const enc = str.slice(ENC_POS);

    const key = this.getKey(secret, salt);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(enc) + decipher.final("utf8");
  };

  return this;
}

function base64Encode(val, { esc }) {
  // input type to buffer
  if (typeof val === "string") {
    val = Buffer.from(val, "utf8");
  } else if (Array.isArray(val)) {
    val = Buffer.concat(val);
  }

  if (!Buffer.isBuffer(val)) throw new Error("Invalid Input");

  // encoding
  val = val.toString("base64");
  // escaping
  if (!esc) return val;
  return val.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64Decode(val, { esc, str }) {
  // un-escaping
  if (esc) {
    val = val.replace(/\-/g, "+").replace(/_/g, "/");
    val += new Array(5 - (val.length % 4)).join("=");
  }

  // decoding
  val = Buffer.from(val, "base64");
  // stringify
  if (!str) return val;
  return val.toString("utf8");
}
