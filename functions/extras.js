const os = require("os");
const crypto = require("crypto");
module.exports = {
  urlLocation,
  uriParser,
  minRoll,
  calcAge,
  calcKms,
  timeAgo,
  mongoObjectId,
  createMongoDbLikeId,
};

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function urlLocation(href) {
  const match = href.match(/^([^\:]+)\:\/?\/?(([^\:\/\?\#]*)(?:\:([0-9]+))?)([\/]{0,1}[^\?\#]*)(\?[^\#]*|)(\#.*|)$/im);
  return (
    match && {
      href: href,
      protocol: match[1],
      host: match[2],
      hostname: match[3],
      port: match[4],
      pathname: match[5],
      search: match[6],
      hash: match[7],
    }
  );
}

function uriParser(input) {
  const parseQS = (search) => {
    try {
      if (!search || typeof search !== "string") return {};
      return JSON.parse('{"' + String(search).replace(/\&/g, '","').replace(/\=/g, '":"') + '"}', function (key, value) {
        return key === "" ? value : decodeURIComponent(value);
      });
    } catch (error) {
      return Object.fromEntries(new URLSearchParams(search));
    }
  };
  const splitStart = (string, needle = ",") => {
    if (!string || typeof string !== "string") throw new Error("1st argument must be a valid string");
    const breaked = String(string).split(needle);
    const firstOne = breaked.shift();
    return [firstOne, breaked.join(needle)];
  };
  const splitEnd = (string, needle = ",") => {
    if (!string || typeof string !== "string") throw new Error("1st argument must be a valid string");
    const breaked = String(string).split(needle);
    const lastOne = breaked.pop();
    return [breaked.join(needle), lastOne];
  };

  if (String(input) === "[object Object]") {
    let str = "";

    if (input.protocol) str += input.protocol + "://";
    if (input.user) {
      str += encodeURIComponent(input.user);
      if (input.pass) str += ":" + encodeURIComponent(input.pass);
      str += "@";
    }

    if (input.host) str += input.host;
    if (input.port) str += ":" + input.port;
    if (input.path) str += "/" + input.path;
    if (input.pathname) str += "/" + input.pathname;
    if (input.query) str += "?" + new URLSearchParams(input.query);

    return str;
  }

  input = String(input);

  // seperate hash
  const [_1, hash] = /\#/.test(input) ? splitEnd(input, "#") : [input];
  // seperate query
  const [_2, query] = /\?/.test(_1) ? splitEnd(_1, "?") : [_1];
  // seperate protocol
  const [protocol, _3] = /\:\/\//.test(_2) ? splitStart(_2, "://") : [, _2];
  console.log(_3);
  // seperate hostname & path
  const [_4, path] = /\//.test(_3) ? splitStart(_3, "/") : [_3, ""];
  // seperate auth & hostname
  const [auth, hostname] = /\@/.test(_4) ? splitEnd(_4, "@") : [, _4];
  // separate user & pass
  let [user, pass] = /\:/.test(auth) ? splitStart(auth, ":") : [auth];
  user = decodeURIComponent(user);
  pass = decodeURIComponent(pass);
  // separate host & port
  const [host, port] = /\:/.test(hostname) ? splitStart(hostname, ":") : [hostname];

  return {
    href: input,
    protocol,
    auth,
    user,
    pass,
    host,
    port,
    hostname,
    pathname: path,
    query,
    queryObj: parseQS(query),
    hash,
  };
}

function minRoll(min) {
  return new Date(new Date().valueOf() + 60e3 * min);
}

function calcAge(dob) {
  return Math.abs(new Date(new Date() - new Date(dob)).getUTCFullYear() - 1970);
}

function calcKms(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371; // Radius of the earth in km
  const deg2rad = (deg) => deg * (Math.PI / 180);

  const lat = deg2rad(lat2 - lat1);
  const lon = deg2rad(lon2 - lon1);

  const accu = Math.sin(lat / 2) * Math.sin(lat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(lon / 2) * Math.sin(lon / 2);
  const calc = 2 * Math.atan2(Math.sqrt(accu), Math.sqrt(1 - accu));
  const dist = earthRadius * calc; // Distance in km
  return dist;
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

function mongoObjectId() {
  const timestamp = ((new Date().getTime() / 1000) | 0).toString(16);
  return (
    timestamp +
    "xxxxxxxxxxxxxxxx"
      .replace(/[x]/g, function () {
        return ((Math.random() * 16) | 0).toString(16);
      })
      .toLowerCase()
  );
}

function createMongoDbLikeId(timestamp, hostname, processId, id) {
  // Building binary data.
  let bin = [];
  bin.push(pack("N", timestamp));
  bin.push(md5(hostname).substring(0, 3));
  bin.push(pack("n", processId));
  bin.push(String(id).substring(1, 3));

  return bin || Buffer.from(bin, "utf8").toString("hex");
}

// console.log(process);
// console.log(os.hostname());
// const machineId = crypto.createHash("md5").update(os.hostname()).digest().slice(0, 3);
// const objectIdCounter = crypto.randomBytes(4).readUInt32BE() & 0xffffff;

// console.log(machineId, objectIdCounter, newObjectId(Date.now(), "alan", 456132, "dsjfhjdskk"));
// Returns a unique objectId as a hex string.
function newObjectId(...args) {
  let buf = new Buffer(12);
  // Current time, 4 bytes.
  buf.writeUInt32BE(Math.floor(Date.now() / 1000), 0);
  // Machine ID, 3 bytes.
  machineId.copy(buf, 4);
  // Process ID, 2 bytes.
  buf.writeUInt16BE(process.pid, 7);
  // Global counter, 3 bytes.
  buf.writeUInt8((objectIdCounter >>> 16) & 0xff, 9);
  buf.writeUInt8((objectIdCounter >>> 8) & 0xff, 10);
  buf.writeUInt8((objectIdCounter >>> 0) & 0xff, 11);

  objectIdCounter = (objectIdCounter + 1) & 0xffffff;
  return buf.toString("hex");
}

const removeFalsy = (obj) => {
  const newObj = {};
  for (const prop of Object.keys(obj)) {
    if (obj[prop]) {
      newObj[prop] = obj[prop];
    }
  }
  return newObj;
};

const isObject = (v) => v && typeof v === "object";

function getDifference(a, b) {
  return Object.assign(...Array.from(new Set([...Object.keys(a), ...Object.keys(b)]), (k) => ({ [k]: isObject(a[k]) && isObject(b[k]) ? getDifference(a[k], b[k]) : a[k] === b[k] })));
}

var obj1 = { prop1: 1, prop2: "foo", prop3: { prop4: 2, prop5: "bar" } },
  obj2 = { prop1: 3, prop2: "foo", prop3: { prop4: 2, prop5: "foobar" }, prop6: "new" };

// console.log(getDifference(obj1, obj2));

async function fetchJson(url, method, options) {
  method = method || "GET";

  let { headers, body, searchParams } = { ...options };

  headers = { ...headers };
  headers["Content-Type"] = "application/json";

  body = body || "";
  body = typeof body === "string" ? body : JSON.stringify(body);

  if (searchParams && Object.keys(searchParams || {}).length > 0) {
    url += url.indexOf("?") !== -1 ? "&" : "?";
    url += new URLSearchParams(searchParams || {}).toString();
  }

  if (method === "GET" || method === "HEAD") {
    body = undefined;
  }

  window.DEBUG && console.log("fetch", ...arguments);
  const resp = await fetch(url, { method, headers, body });
  return resp.json();
}
