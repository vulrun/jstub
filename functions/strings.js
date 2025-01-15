const { isNumber } = require("./dataType");

module.exports = {
  limitNum,
  toDecimals,
  randomNumber,
  randomString,
  generateNonce,
  generateUniqueVal,
  uuid4,
  rot31,
  rot13,
  reverseStr,
  trimStr,
  sanitize,
  slugify,
  stringify,
  toShortFormat,
  renderTemplate,
};

/**
 * Limits the number to be within the provided min and max range.
 *
 * @param {number} num - The number to be limited.
 * @param {number} [min=0] - The minimum limit for the number.
 * @param {number} [max=0] - The maximum limit for the number.
 * @returns {number} - The limited number within the range.
 */
function limitNum(num, min, max) {
  num = Math.max(min || 0, num || 0);
  num = Math.min(num, max || 0);
  return num;
}

/**
 * Rounds a value to a specified number of decimal places.
 *
 * @param {number} val - The value to be rounded.
 * @param {number} [decimal=2] - The number of decimal places (optional, default is 2).
 * @returns {number} - The rounded value.
 */
function toDecimals(val, decimal) {
  decimal = decimal || 2;
  const base = Math.pow(10, decimal);
  return Math.round(val * base) / base;
}

/**
 * Generates a random number up to a specified maximum value.
 *
 * @param {number} [max=Date.now()] - The maximum value for the random number (optional, default is current timestamp).
 * @returns {number} - The random number.
 */
function randomNumber(max) {
  max = max || Date.now();
  return Math.abs((Math.random() * max) | 0);
}

/**
 * Generates a random alphanumeric string based on a pattern or length.
 *
 * @param {string|number} [input="aaaa-aaa-1234"] - A string pattern or a number specifying the length of the random string (optional).
 * @returns {string} - The generated random string.
 */
function randomString(input = "aaaa-aaa-1234") {
  const numericals = "0123465789";
  const lowerAlpha = "abcdefghijklmnopqrstuvwxyz";
  const upperAlpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  if (typeof input === "number") {
    let set = numericals + lowerAlpha + upperAlpha;
    let str = "";
    while (input--) str += set[randomNumber(set.length)];
    return str;
  }

  return String(input).replace(/[0-9a-z*]/gi, function (val) {
    if (numericals.indexOf(val) > -1) return numericals[randomNumber(numericals.length)];
    if (lowerAlpha.indexOf(val) > -1) return lowerAlpha[randomNumber(lowerAlpha.length)];
    if (upperAlpha.indexOf(val) > -1) return upperAlpha[randomNumber(upperAlpha.length)];
    return Math.random().toString(36).slice(-1);
  });
}

/**
 * Generates a cryptographically secure nonce of a specified length.
 *
 * @param {number} [len=16] - The length of the nonce (optional, default is 16).
 * @returns {string} - The generated nonce.
 * @throws {Error} - Throws an error if the length is not a positive integer or is too large.
 */
function generateNonce(len = 16) {
  if (typeof len !== "number" || len <= 0 || !Number.isInteger(len)) {
    throw new Error("Length must be a positive integer.");
  }

  // Ensure the length is within reasonable bounds
  if (len > 1024) throw new Error("Length is too large. Maximum length allowed is 1024 bytes.");

  // Function to generate a random value between 0 and 255 (1 byte)
  const getRandomByte = () => Math.floor(Math.random() * 256);
  const nonceArray = new Array(len).fill(0).map(() => getRandomByte());
  return nonceArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Generates a unique value using date and randomness
 *
 * @returns {number} - The unique val.
 */
function generateUniqueVal(toStringAs) {
  toStringAs = toStringAs == 16 ? 16 : 36;
  const randomVal = Math.random().toString(toStringAs).substring(2, 10);
  const timestamp = Date.now() * 1e9;
  return timestamp.toString(toStringAs) + randomVal;
}

/**
 * Generates a version 4 UUID (random-based).
 *
 * @returns {string} - The generated UUID v4 string.
 */
function uuid4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (chr) => {
    const random = (Math.random() * 16) | 0;
    const hex = chr == "x" ? random : (random & 0x3) | 0x8;
    return hex.toString(16);
  });
}

/**
 * Performs a ROT31 character encoding (shifts characters by half of the set).
 *
 * @param {string} str - The string to encode.
 * @returns {string} - The encoded string.
 */
function rot31(str) {
  const set = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";
  let i = 0;
  do {
    const idx = set.indexOf(str[i]);
    const rot = (idx + set.length / 2) % set.length;
    result += ~idx ? set[rot] : str[i];

    i++;
  } while (i < str.length);

  return result;
}

/**
 * Encodes a string using the ROT13 cipher (shifts letters by 13 positions).
 *
 * @param {string} str - The string to encode.
 * @returns {string} - The ROT13 encoded string.
 */
function rot13(str) {
  return String(str).replace(/[a-z]/gi, (c) => String.fromCharCode(c.charCodeAt() + 13 - 26 * /[n-z]/i.test(c)));
}

/**
 * Reverses the order of characters in a string.
 *
 * @param {string} str - The string to reverse.
 * @returns {string} - The reversed string.
 */
function reverseStr(str) {
  return String(str).split("").reverse().join("");
}

/**
 * Trims specified characters from the beginning and/or end of a string.
 *
 * @param {string} str - The string to trim.
 * @param {string} [char=" "] - The character to trim (optional, default is whitespace).
 * @param {string} [side="lr"] - The side(s) to trim: "l" for left, "r" for right, or "lr" for both sides (optional, default is "lr").
 * @returns {string} - The trimmed string.
 */
function trimStr(str, char, side) {
  side = side || "lr";
  char = char ? String(char) : "";
  const spaces = "\\0\\t\\n\\r\\x0B ";

  const regexp = [];
  /l/i.test(side) && regexp.push("^[" + char + spaces + "]+");
  /r/i.test(side) && regexp.push("[" + char + spaces + "]+$");

  return String(str).replace(new RegExp(regexp.join("|"), "g"), "");
}

/**
 * Sanitizes a string by collapsing multiple spaces and trimming edges.
 *
 * @param {string} str - The string to sanitize.
 * @returns {string} - The sanitized string.
 */
function sanitize(str) {
  return String(str || "")
    .replace(/\s\s+/g, " ")
    .replace(/^\s+/g, "")
    .replace(/\s+$/g, "");
}

/**
 * Converts a string into a URL-friendly "slug" format with a specified separator.
 *
 * @param {string} str - The string to convert into a slug.
 * @param {string} [sep="-"] - The separator to use in the slug (optional, default is "-").
 * @returns {string} - The slugified string.
 */
function slugify(str, sep) {
  sep = sep || "-";
  str = String(str).toLowerCase();
  // replace non alpha-numericals
  str = str.replace(/[^a-z0-9]/g, sep);
  // remove repetitive seperators
  str = str.replace(new RegExp(sep + sep + "+", "g"), sep);
  // trim seperators
  str = str.replace(new RegExp("^" + sep + "|" + sep + "$", "g"), "");
  return str;
}

/**
 * Safely stringifies data into a string, handling various types.
 *
 * @param {any} data - The data to stringify.
 * @returns {string} - The stringified data.
 */
function stringify(data) {
  if (!data) return "";
  if (typeof data === "string") return data;

  return JSON.stringify(data);
}

/**
 * Renders a template string with dynamic values by replacing placeholders with data.
 *
 * @param {string} str - The template string containing placeholders.
 * @param {object} data - The object containing key-value pairs for placeholder replacements.
 * @returns {string} - The rendered string with replaced values.
 */
function renderTemplate(str, data) {
  if (typeof str !== "string") return "";
  if (!Object.keys(data).length) return str;

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      let regex = new RegExp("{{" + key + "}}", "g");
      str = str.replace(regex, data[key]);
    }
  }

  return str;
}

/**
 * Converts a number into a short format with appropriate suffix (K, M, B, etc.).
 *
 * @param {number} num - The number to format.
 * @param {number} [precision=2] - The number of decimal places (optional, default is 2).
 * @returns {string} - The short format string with suffix.
 */
function toShortFormat(num, precision = 2) {
  if (!isNumber(num)) return null;

  const _shortFormat = (n, p, u) => {
    if (p <= 0) return toDecimals(n, p) + (u || "");

    // remove un-necessary zeroes after decimal: 1.0 -> 1; 1.00 -> 1;
    // intentionally doesn't affect partials:  1.50 -> 1.50;
    const dotZeros = "." + "".padEnd(p, "0");
    return toDecimals(n, p).toString().replace(dotZeros, "") + (u || "");
  };

  // 0 - 900
  if (Math.abs(num) < 900) return _shortFormat(num, precision);
  // 0.9k-850k
  if (Math.abs(num) < 9e5) return _shortFormat(num / 1e3, precision, "K");
  // 0.9m-850m
  if (Math.abs(num) < 9e8) return _shortFormat(num / 1e6, precision, "M");
  // 0.9b-850b
  if (Math.abs(num) < 9e11) return _shortFormat(num / 1e9, precision, "B");
  // 0.9t+
  return _shortFormat(num / 1e12, precision, "T");
}
