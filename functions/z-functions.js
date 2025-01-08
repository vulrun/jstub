function $persist(key, value) {
  // set the values
  if (typeof value !== "undefined") {
    if (value === null) {
      localStorage.removeItem(key);
    } else if (typeof value === "string") {
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  // get the values
  const stored = localStorage.getItem(key);
  try {
    return JSON.parse(stored);
  } catch (e) {
    return stored;
  }
}

function ms(str) {
  str = String(str);
  if (str.length > 100) return 0;

  const match = /^([\+\-]?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
  if (!match) return 0;

  const unit = (match[2] || "ms").toLowerCase();
  const n = parseFloat(match[1]);
  const s = 1000;
  const m = s * 60;
  const h = m * 60;
  const d = h * 24;
  const w = d * 7;
  const y = d * 365.25;
  switch (unit) {
    case "years":
    case "year":
    case "yrs":
    case "yr":
    case "y":
      return n * y;
    case "weeks":
    case "week":
    case "w":
      return n * w;
    case "days":
    case "day":
    case "d":
      return n * d;
    case "hours":
    case "hour":
    case "hrs":
    case "hr":
    case "h":
      return n * h;
    case "minutes":
    case "minute":
    case "mins":
    case "min":
    case "m":
      return n * m;
    case "seconds":
    case "second":
    case "secs":
    case "sec":
    case "s":
      return n * s;
    case "milliseconds":
    case "millisecond":
    case "msecs":
    case "msec":
    case "ms":
      return n;
    default:
      return 0;
  }
}

function isDate(date) {
  date = new Date(date);
  return date instanceof Date && !isNaN(date);
}

function mathjs(str) {
  return Function(`'use strict'; return (${str})`)();
}

function sortObj(obj) {
  if (Object.keys(obj).length) {
    obj = Object.entries(obj).sort();
    obj = Object.fromEntries(obj);
  }
  return obj;
}

function sortBy(key, order) {
  if (!key) return;

  order = order === -1 ? -1 : 1;
  this.items.sort((a, b) => {
    if (a[key] > b[key]) return 1 * order;
    if (a[key] < b[key]) return -1 * order;
    return 0;
  });
}

function nonce(val) {
  if (typeof val === "string" && val.length > 1) return val;
  val = val || Date.now();
  return Number(val).toString(36);
}

function randomNum(max) {
  max = max || Date.now();
  return Math.floor(Math.random() * max);
}

function stringify(str) {
  if (!str) return "";
  return typeof str === "string" ? str : JSON.stringify(str);
}

function deep_copy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function changeHref(path) {
  if (window.history.pushState) {
    window.history.pushState({}, "", path);
  }
  return;
}
