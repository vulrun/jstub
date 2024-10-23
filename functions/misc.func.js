const lo = require("lodash");

module.exports = {
  deepCopy,
  delay,
  calcAge,
  calcKms,
  maskData,
  findAll,
  replaceParams,
};

function deepCopy(data) {
  if (!data) return data;

  const seen = new WeakSet();
  const retVal = JSON.stringify(data, (key, value) => {
    if (typeof value === "object" && value !== null) {
      // duplicate reference found
      if (seen.has(value)) return "[Circular]";
      // add this reference for future use
      seen.add(value);
    }
    return value;
  });

  return JSON.parse(retVal);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function maskData(str) {
  str = String(str || "");

  const _withIn = (min, num, max) => min <= num && num <= max;
  const hintLen = Math.floor(str.length / 2);

  let masked = "";
  if (_withIn(0, str.length, 9)) {
    masked += "".padEnd(str.length - hintLen, "x");
    masked += str.slice(-hintLen);

    return str.slice(-1 * hintLen).padStart(str.length, "x");
  } else {
    masked += str.slice(0, hintLen / 2);
    masked += "".padEnd(str.length - hintLen, "x");
    masked += str.slice(-(hintLen / 2));
  }

  return masked;
}

function findAll(data, pipeline) {
  if (!pipeline.length) return data;

  for (let operation of pipeline) {
    const [todo, ...args] = operation;

    switch (todo) {
      case "sort":
        const keys = Object.keys(args[0]);
        if (keys.length) {
          const values = Object.values(args[0]).map((i) => (i > 0 ? "asc" : "desc"));
          data = lo.orderBy(data, keys, values);
        }
        break;

      case "find":
        data = lo.filter(data, args[0]);
        break;

      case "skip":
        data = data.slice(args[0]);
        break;

      case "limit":
        data = data.slice(0, args[0]);
        break;
    }
  }

  return data;
}

function replaceParams(params, data) {
  params = [].concat(params);

  // json support added
  if (typeof data !== "string") {
    data = JSON.stringify(data);
  }
  // replacing each params
  params.forEach((itm, idx) => {
    idx++;
    if (typeof itm === "number") {
      data = data.replaceAll(`"$${idx}"`, itm);
    } else {
      data = data.replaceAll(`$${idx}`, itm);
    }
    return;
  });

  try {
    return JSON.parse(data);
  } catch (err) {
    return data;
  }
}
