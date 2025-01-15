module.exports = {
  dateMs,
  dateFormat,
  timeFormat,
  parseTime,
  relativeTime,
};

/**
 *
 * @param {string}
 * @returns {number}
 * @example dateMs("now")
 * @example dateMs("500ms ahead")
 * @example dateMs("1s ago")
 */
function dateMs(str) {
  str = String(str || "now").replace(/\s/g, "");
  if (str === "now") return Date.now();
  if (str.length > 100) throw new Error("Value exceeds the maximum length of 100 characters.");

  // match for input values
  const matches = /^(-?(?:\d+)?\.?\d+)[\-\.\_ ]*(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?[\-\.\_ ]*(ago|ahead)?$/i.exec(str);
  if (!matches) return NaN;

  // sanitize variables
  let [___, num, unit, mode] = matches;
  num = parseFloat(num);
  unit = (unit || "ms").toLowerCase();
  mode = (mode || "").toLowerCase();

  // unit values
  const s = 1000;
  const m = s * 60;
  const h = m * 60;
  const d = h * 24;
  const w = d * 7;
  const y = d * 365.25;

  // cases
  switch (unit) {
    case "years":
    case "year":
    case "yrs":
    case "yr":
    case "y":
      num *= y;
      break;
    case "weeks":
    case "week":
    case "w":
      num *= w;
      break;
    case "days":
    case "day":
    case "d":
      num *= d;
      break;
    case "hours":
    case "hour":
    case "hrs":
    case "hr":
    case "h":
      num *= h;
      break;
    case "minutes":
    case "minute":
    case "mins":
    case "min":
    case "m":
      num *= m;
      break;
    case "seconds":
    case "second":
    case "secs":
    case "sec":
    case "s":
      num *= s;
      break;
    case "milliseconds":
    case "millisecond":
    case "msecs":
    case "msec":
    case "ms":
      break;
    default:
      num = 0;
  }

  // modify as per selected mode
  if (mode === "ago") return Date.now() - num;
  if (mode === "ahead") return Date.now() + num;
  return num;
}

/**
 *
 * @param {*} date
 * @param {*} format
 * @returns
 * @example dateFormat(new Date(), <format_pattern>)
 * @example dateFormat(null, "It's [ddd] today, I'm coding on [MMM DD, YYYY] at [hh:mm:ss]")
 * @example dateFormat("2020-01-25T12:30:45", "It's [ddd] today, I'm coding on [MMM DD, YYYY] at [hh:mm:ss]. My Timezone is [ZZ], which is a [zz].")
 */
function dateFormat(date, format) {
  if (!date) date = Date.now();
  if (!format) return new Date(date).toISOString();

  // listing all the possible keys to regexp
  const regExMaps = {
    ddd: new RegExp("sun|mon|tue|wed|thu|fri|sat", "i"),
    MMM: new RegExp("jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec", "i"),
    DD: /\d{2}(?=\s\d{4}\s)/,
    YYYY: /\d{4}(?=\s\d{2}:\d{2}:\d{2})/,
    hh: /\d{2}(?=:\d{2}:\d{2})/,
    mm: /\d{2}(?=:\d{2}\s)/,
    ss: /\d{2}(?=\s[A-Z]{3})/,
    ZZ: /(?<=GMT)[+-]?\d{4}/,
    zz: /(?<=GMT[+-]?\d{4}\s\()[\w\s]+(?=\))/,
  };

  // creating regexp to query the string
  const regExKeys = new RegExp(Object.keys(regExMaps).join("|"), "gi");

  let str = format;
  // extracting the matchable words & looping through
  format.match(regExKeys).forEach((regEx) => {
    if (regExMaps[regEx]) str = str.replace(regEx, new Date(date).toString().match(regExMaps[regEx]));
  });

  return str;
}

/**
 *
 * @param {number} ms
 * @returns {string}
 * @example timeFormat(3725000)
 * @example timeFormat(3000)
 * @example timeFormat(100)
 */
function timeFormat(ms) {
  if (ms < 200) return "";
  const secs = Math.floor(ms / 1000);

  let out = [];

  const hh = Math.floor(secs / 3600);
  const mm = Math.floor((secs / 60) % 60);
  const ss = Math.floor(secs % 60);

  // push to array
  hh > 0 && out.push(hh);
  out.push(mm, ss);

  return out.map((i) => String(i).padStart(2, "0")).join(":");
}

/**
 *
 * @param {*} inp
 * @returns {number} milliseconds
 * @example parseTime("14:30:00")
 * @example parseTime("02:30:00 PM")
 */
function parseTime(inp) {
  const time24RegEx = /^\s*(?:0?\d|1\d|2[0123])(?:\:[012345]\d)(?:\:[012345]\d)?(?!\:)\s*$/gm;
  const time12RegEx = /^\s*((?:0?\d|1[012])(?:\:[012345]\d)(?:\:[012345]\d)?)(?!\:)\s?([aApP][mM])\s*$/gm;

  let matched;
  if ((matched = time24RegEx.exec(inp))) {
    inp = `1970-01-01 ${inp} +0:00`;
    return Date.parse(inp);
  }

  if ((matched = time12RegEx.exec(inp))) {
    inp = `1970-01-01 ${matched[1]} +0:00`;
    return Date.parse(inp) + (matched[2].toLowerCase() == "pm" ? dateMs("12h") : 0);
  }

  return Date.parse(inp);
}

function _relativeTimeFormat(num, unit, tinyFormat) {
  // const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" });
  // return rtf.format(diff, interval);

  const tinyUnits = { decade: "decade", year: "yr", month: "month", week: "wk", day: "day", hour: "hr", minute: "min", second: "sec" };

  if (tinyFormat) unit = tinyUnits[unit];

  if (num > 0) return `in ${Math.abs(num)} ${unit}${num > 1 ? "s" : ""}`;
  if (num < 0) return `${Math.abs(num)} ${unit}${num < -1 ? "s" : ""} ago`;

  return "just now";
}

/**
 *
 * @param {*} date
 * @returns {string}
 * @example relativeTime(Date.now())
 * @example relativeTime(Date.now() - dateMs("1d"))
 * @example relativeTime(Date.now() - dateMs("2w"))
 * @example relativeTime(Date.now() + dateMs("2w"))
 * @example relativeTime(Date.now() + dateMs("2w"))
 */
function relativeTime(date, options) {
  const now = new Date();
  const diffInMs = new Date(date) - now;
  if (Math.abs(diffInMs) <= 500) return "just now";

  const diffInSecs = Math.floor(diffInMs / 1000);
  const timeIntervals = {
    decade: 60 * 60 * 24 * 30 * 12 * 10,
    year: 60 * 60 * 24 * 30 * 12,
    month: 60 * 60 * 24 * 30,
    week: 60 * 60 * 24 * 7,
    day: 60 * 60 * 24,
    hour: 60 * 60,
    minute: 60,
    second: 1,
  };

  for (const interval in timeIntervals) {
    const intervalInSecs = timeIntervals[interval];

    // if (interval !== "second") continue;
    if (Math.abs(diffInSecs) < intervalInSecs) continue;

    const diff = Math.round(diffInSecs / intervalInSecs);
    return _relativeTimeFormat(diff, interval, options?.tiny || false);
  }

  return "just now";
}
