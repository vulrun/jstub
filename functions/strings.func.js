const crypto = require("crypto");

module.exports = {
  limitNum,
  toDecimals,
  randomNumber,
  randomString,
  sanitize,
  rot31,
  rot13,
  reverseStr,
  trimStr,
  slugify,
  stringify,
  uuid,
  uuid4,
};

function limitNum(num, min, max) {
  num = num || 0;
  min = min || 0;
  max = max || 0;
  num = Math.max(min, num);
  num = Math.min(num, max);
  return num;
}

function toDecimals(val, decimal) {
  decimal = decimal || 2;
  const base = Math.pow(10, decimal);
  return Math.round(val * base) / base;
}

function randomNumber(max) {
  max = max || Date.now();
  return Math.abs((Math.random() * max) | 0);
}

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

function sanitize(str) {
  return String(str || "")
    .replace(/\s\s+/g, " ")
    .replace(/^\s+/g, "")
    .replace(/\s+$/g, "");
}

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

function rot13(str) {
  return String(str).replace(/[a-z]/gi, (c) => String.fromCharCode(c.charCodeAt() + 13 - 26 * /[n-z]/i.test(c)));
}

function reverseStr(str) {
  return String(str).split("").reverse().join("");
}

function trimStr(str, char, side) {
  side = side || "lr";
  char = char ? String(char) : "";
  const spaces = "\\0\\t\\n\\r\\x0B ";

  const regexp = [];
  /l/i.test(side) && regexp.push("^[" + char + spaces + "]+");
  /r/i.test(side) && regexp.push("[" + char + spaces + "]+$");

  return String(str).replace(new RegExp(regexp.join("|"), "g"), "");
}

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

function stringify(data) {
  if (!data) return "";
  if (typeof data !== "string") return JSON.stringify(data);
  return data;
}

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (chr) => {
    const random = (Math.random() * 16) | 0;
    const hex = chr == "x" ? random : (random & 0x3) | 0x8;
    return hex.toString(16);
  });
}

function uuid4() {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  let rand = crypto.randomBytes(16);
  rand[6] = (rand[6] & 0x0f) | 0x40;
  rand[8] = (rand[8] & 0x3f) | 0x80;
  rand = rand.toString("hex").match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
  rand.shift();
  return rand.join("-");
}

// todos
function numFormat(num) {
  if (num >= 0 && num < 1e3) return Math.floor(num);
  if (num >= 1e3 && num < 1e6) return Math.floor(num / 1e3) + "K";
  if (num >= 1e6 && num < 1e9) return Math.floor(num / 1e6) + "M";
  if (num >= 1e9 && num < 1e12) return Math.floor(num / 1e9) + "B";
  if (num >= 1e12) return Math.floor(num / 1e12) + "T";
  return 0;
}

function shortFormat(num, precision = 2) {
  const number_format = (n, p) => n.toFixed(p);
  let suffix = "";
  let format = 0;
  if (num < 900) {
    // 0 - 900
    format = number_format(num, precision);
  } else if (num < 9e5) {
    // 0.9k-850k
    format = number_format(num / 1e3, precision);
    suffix = "K";
  } else if (num < 9e8) {
    // 0.9m-850m
    format = number_format(num / 1e6, precision);
    suffix = "M";
  } else if (num < 9e11) {
    // 0.9b-850b
    format = number_format(num / 1e9, precision);
    suffix = "B";
  } else {
    // 0.9t+
    format = number_format(num / 1e12, precision);
    suffix = "T";
  }
  // remove unecessary zeroes after decimal, "1.0" -> "1"; "1.00" -> "1";
  // intentionally doesn't affect partials,  "1.50" -> "1.50";
  if (precision > 0) {
    const dotZeros = "." + "".padEnd(precision, "0");
    format = format.replace(dotZeros, "");
  }
  return format + suffix;
}

String.prototype.render = function (data) {
  let str = String(this);
  if (!Object.keys(data).length) return str;

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      let regex = new RegExp("{{" + key + "}}", "g");
      str = str.replace(regex, data[key]);
    }
  }

  return str;
};

function randomize(input = 20, charset) {
  if (typeof input !== "number" && typeof input !== "string") throw new Error("`input must be a number or string`");
  const numericals = "0123465789";
  const lowerAlpha = "abcdefghijklmnopqrstuvwxyz";
  const upperAlpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  if (typeof input === "number") {
    let set = charset ? charset : numericals + lowerAlpha + upperAlpha;
    let str = "";
    while (input--) str += set[0 | (Math.random() * set.length)];
    return str;
  }

  return String(input).replace(/[0-9a-z*]/gi, function (val) {
    if (numericals.indexOf(val) > -1) return numericals[0 | (Math.random() * numericals.length)];
    if (lowerAlpha.indexOf(val) > -1) return lowerAlpha[0 | (Math.random() * lowerAlpha.length)];
    if (upperAlpha.indexOf(val) > -1) return upperAlpha[0 | (Math.random() * upperAlpha.length)];
    return Math.random().toString(36)[2];
  });
}
