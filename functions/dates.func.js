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
