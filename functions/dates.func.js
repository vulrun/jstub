module.exports = {
  dateMs,
  timeAgo,
  timeFormat,
};

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

function timeAgo(unix) {
  unix = new Date().getTime() - new Date(unix).getTime();
  unix = Math.max(0, unix / 1000);

  const periods = {
    decade: 60 * 60 * 24 * 30 * 12 * 10,
    year: 60 * 60 * 24 * 30 * 12,
    month: 60 * 60 * 24 * 30,
    week: 60 * 60 * 24 * 7,
    day: 60 * 60 * 24,
    hr: 60 * 60,
    min: 60,
    sec: 1,
  };

  if (periods.year * 5 < unix) return "";

  for (const unit in periods) {
    if (unix < periods[unit]) continue;

    const number = Math.floor(unix / periods[unit]);
    return "".concat(number, " ", unit, number > 1 ? "s ago" : " ago");
  }

  return "just now";
}

function timeFormat(secs) {
  if (secs < 5) return "";
  secs = Math.floor(secs / 1000);

  let out = [];

  const hh = Math.floor(secs / 3600);
  const mm = Math.floor((secs / 60) % 60);
  const ss = Math.floor(secs % 60);

  // push to array
  hh > 0 && out.push(hh);
  out.push(mm, ss);

  out = out.map((i) => String(i).padStart(2, "0")).join(":");
  return out;
}

function dateFormat(date, format) {
  // Format: "It's [ddd] today, I'm coding on [MMM DD, YYYY] at [hh:mm:ss]. My Timezone is [ZZ], which is a [zz]."
  // Usage: dateFormat('2020-01-25')
  // Usage: dateFormat(new Date(), <format_pattern>)

  if (!date) date = Date.now();
  if (!format) return new Date(date).toString();

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

function timeDuration(val, { as, tiny = false }) {
  val = typeof val === "number" && isFinite(val) ? Math.abs(val) : Date.now() - parseInt(val);

  if (!val) throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));

  const tinyUnit = { Y: "yr", M: "month", W: "wk", D: "day", h: "hr", m: "min", s: "sec" };
  const longUnit = { Y: "year", M: "month", W: "week", D: "day", h: "hour", m: "minute", s: "second" };

  const _s = 1000;
  const _m = _s * 60;
  const _h = _m * 60;
  const _d = _h * 24;
  const period = {
    Y: _d * 365.25,
    M: _d * 30,
    W: _d * 7,
    D: _d,
    h: _h,
    m: _m,
    s: _s,
  };

  let num, unit;
  if (as) {
    unit = as;
    num = Math.floor(val / period[unit]);
  } else {
    for (unit in period) {
      const unitInMs = period[unit];
      if (val < unitInMs) continue;

      num = Math.floor(val / unitInMs);
      break;
    }
  }

  this.format = function (str) {
    return String(str || "%d%s")
      .replace(/%d/g, num)
      .replace(/%s/g, unit)
      .replace(/%S/g, (!!tiny ? tinyUnit[unit] : longUnit[unit]) + (num > 1 ? "s" : ""));
  };

  return this;
}

function parseDate(inp) {
  let matched;
  const time24RegEx = /^\s*(?:0?\d|1\d|2[0123])(?:\:[012345]\d)(?:\:[012345]\d)?(?!\:)\s*$/gm;
  const time12RegEx = /^\s*((?:0?\d|1[012])(?:\:[012345]\d)(?:\:[012345]\d)?)(?!\:)\s?([aApP][mM])\s*$/gm;

  if ((matched = time24RegEx.exec(inp))) {
    inp = `1970-01-01 ${inp} +0:00`;
    return Date.parse(inp);
  }

  if ((matched = time12RegEx.exec(inp))) {
    inp = `1970-01-01 ${matched[1]} +0:00`;
    return Date.parse(inp) + (matched[2].toLowerCase() == "pm" ? 12 * 60 * 60 * 1e3 : 0);
  }

  return Date.parse(inp);
}
