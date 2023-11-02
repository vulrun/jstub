const deepCopy = (data) => JSON.parse(JSON.stringify(data));

module.exports = {
  addToSet,
  removeFromSet,
  sortArr,
  sortObj,
  cleanJson,
  getObjPropValue,
  toObject,
  extendObj,
};

function addToSet(array, value) {
  return array.includes(value) ? array.slice(0) : array.concat([value]);
}

function removeFromSet(array, value) {
  const index = array.indexOf(value);
  index > -1 && array.splice(index, 1);
  return array;
}

function sortArr(array, sortOrder, sortKey) {
  if (!Array.isArray(array)) throw new Error("Not an array");

  // defaults to ascending
  if (sortOrder === "desc" || sortOrder === -1) {
    sortOrder = -1;
  } else {
    sortOrder = 1;
  }

  // sorting array & array of object
  if (sortKey) {
    return array.sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return -1 * sortOrder;
      if (a[sortKey] > b[sortKey]) return 1 * sortOrder;
      return 0;
    });
  } else {
    return array.sort((a, b) => {
      if (a < b) return -1 * sortOrder;
      if (a > b) return 1 * sortOrder;
      return 0;
    });
  }
}

function sortObj(obj) {
  if (Object.keys(obj).length) {
    obj = Object.entries(obj).sort();
    obj = Object.fromEntries(obj);
  }
  return obj;
}

function cleanJson(data) {
  const regexJsonp = /^(?:[^\(]+)\(|\)$/g;
  const regexWhiteSpace = /[\0\f\t\n\r\x0B]+/g;

  // handling jsonp
  if (typeof data === "string") {
    if (regexJsonp.test(data)) {
      data = data.replace(regexJsonp, "");
    }
  } else {
    data = JSON.stringify(data);
  }

  try {
    return JSON.parse(data);
  } catch (err) {
    data = data.replace(regexWhiteSpace, " ");
    return JSON.parse(data);
  }
}

function getObjPropValue(obj, path) {
  if (!path) return obj;

  if (Array.isArray(path)) {
    const [top, ...rest] = path;

    // look into one level
    obj = obj[top];
    path = rest;

    // oops, nullish value
    if (!obj) return obj;

    // wow, this is last level
    if (rest.length === 0) return obj;
  } else {
    path = String(path).split(".");
  }

  return getObjPropValue(obj, path);
}

function extendObj(ref, ...objs) {
  const org = deepCopy(ref);

  for (const obj of objs) {
    for (const key in obj) {
      if (obj[key]) {
        org[key] = obj[key];
      } else {
        continue;
      }
    }
  }
  return org;
}

function toObject(data, key, val) {
  if (!Array.isArray(data)) throw new Error("INVALID_DATA");
  if (!key || typeof key !== "string") throw new Error("INVALID_KEY");

  const newObj = {};
  if (data.length > 0) {
    for (const item of data) {
      newObj[item[key] + ""] = !!val ? item[val] : item;
    }
  }
  return newObj;
}
