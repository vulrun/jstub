const { validateValue } = require("./misc");
const {
  isNull, //
  isUndefined,
  isArray,
  isObject,
  isString,
  isStringValid,
  isNumber,
  isBoolean,
  isNullish,
} = require("./dataType");

module.exports = {
  uniqueArray,
  removeArrayValues,
  cleanJson,
  removeFalsy,
  toObject,
  getObjPropValue,
  extendObj,
  sortObjKeys,
  sortArray,
  sortBy,
  unwindArray,
};

/**
 * adds unique value to an array, or
 * concat values to array and returns a unique array
 * @param {any} array
 * @param  {...any} values
 * @returns {array}
 */
function uniqueArray(...values) {
  return [...new Set([].concat(...values).filter(Boolean))];
}

/**
 * remove values from array
 * @param {*} array
 * @param  {...any} values
 * @returns
 */
function removeArrayValues(array, ...values) {
  array = [].concat(array).filter(Boolean);
  values = [].concat(...values).filter(Boolean);

  values.forEach((value) => {
    const index = array.indexOf(value);
    index > -1 && array.splice(index, 1);
  });

  return array;
}

/**
 * cleans and parses unwanted
 * white spaces, jsonp callbacks
 * @param {*} data
 * @returns data
 */
function cleanJson(data) {
  if (isNull(data) || isUndefined(data)) return null;

  const regexJsonp = /^(?:[^\(]+)\(|\)$/g;
  const regexWhiteSpace = /[\0\f\t\n\r\x0B]+/g;

  if (!isString(data)) {
    data = JSON.stringify(data);
  }
  // handling jsonp
  if (isString(data) && regexJsonp.test(data)) {
    data = data.replace(regexJsonp, "");
  }

  try {
    return JSON.parse(data);
  } catch (err) {
    data = data.replace(regexWhiteSpace, " ");
    return JSON.parse(data);
  }
}

/**
 * removeFalsy: removes falsy values from an object
 * @param {object} obj
 * @param {function} falsyFunc
 * @returns
 */
function removeFalsy(obj, falsyFunc) {
  if (!isObject(obj)) return {};

  const newObj = {};
  for (const [key, val] of Object.entries(obj)) {
    if (isNull(val)) continue;
    if (isUndefined(val)) continue;
    if (typeof falsyFunc === "function" && falsyFunc(val)) continue;

    newObj[key] = val;
  }
  return newObj;
}

/**
 * toObject: converts array to object with specified
 * keys, values
 * @param {*} data
 * @param {*} key
 * @param {*} val
 * @param {*} keyFunc
 * @param {*} valFunc
 * @returns
 */
function toObject(data, key, val, keyFunc, valFunc) {
  if (!isArray(data)) throw new Error("INVALID_DATA");
  if (data.length <= 0) return {};
  if (!isStringValid(key)) throw new Error("INVALID_KEY");

  const newObj = {};
  for (const item of data) {
    let k = String(item[key]);
    let v = isStringValid(val) ? item[val] : item;
    if (typeof keyFunc === "function") k = keyFunc(k);
    if (typeof valFunc === "function") v = valFunc(v);
    newObj[k] = v;
  }
  return newObj;
}

/**
 * retrieves nested object values, or
 * finds a dot-notation value of a object path
 * @param {*} obj
 * @param {*} path
 * @param {*} _def
 * @returns value
 */
function getObjPropValue(obj, path, _def) {
  if (!path) return obj || _def;

  if (!isArray(path)) {
    path = String(path).split(".");
  }

  const [top, ...rest] = path;

  // look into first level
  obj = obj?.[top];
  path = rest;

  // oops, nullish value
  if (!obj) return obj || _def;

  // wow, this is last level
  if (rest.length === 0) return obj || _def;

  return getObjPropValue(obj, path, _def);
}

/**
 * extendObj: merges multiple objects into a base object
 * @param {*} ref
 * @param  {...any} objs
 * @returns the extended object
 */
function extendObj(ref, ...objs) {
  const base = { ...ref };

  for (const obj of objs) {
    if (isNull(obj)) continue;
    if (isUndefined(obj)) continue;

    for (const key in obj) {
      if (isNull(obj?.[key])) continue;
      if (isUndefined(obj?.[key])) continue;

      base[key] = obj[key];
    }
  }

  return base;
}

/**
 * sorts object keys alphabetically
 * @param {*} obj
 * @returns {*} obj
 */
function sortObjKeys(obj) {
  if (Object.keys(obj).length) {
    obj = Object.entries(obj).sort();
    obj = Object.fromEntries(obj);
  }
  return obj;
}

/**
 * Sorts an array based on provided keys and orders.
 *
 * This function can handle sorting:
 * - A plain array of values in ascending or descending order.
 * - An array of objects by one or multiple keys, each with its own sort order (ascending or descending).
 *
 * The function supports different input types for sorting parameters:
 * - `keys` and `orders` can be arrays, where each key in `keys` corresponds to an order in `orders`.
 * - `keys` can also be an object, where the keys represent the property names to sort by, and the values represent the sort order.
 * - If only one key and order are provided as strings, it sorts by the specified key in the specified order.
 *
 * @param {Array} array - The array to be sorted.
 * @param {Array|string|object|null} keys - The keys or properties to sort by. Can be an array, string, or object.
 * @param {Array|string|number|null} orders - The orders corresponding to the keys. Can be an array, string, or number.
 * @returns {Array} - A new sorted array.
 */
function sortArray(array, keys, orders) {
  if (!Array.isArray(array)) throw new Error("sortArray: 1st argument must be an array");
  if (array.length <= 1) return array.slice(); // Return a copy for empty or single element arrays

  const lodashOrderBy = (orderArray, orderKeys, orderDir) => {
    // if orderKeys is null and orderDir is a string or number, sort as a plain array
    if (isNull(orderKeys) && (isStringValid(orderDir) || isNumber(orderDir))) {
      return orderArray.slice().sort((a, b) => {
        const orderMultiplier = orderDir === "desc" || orderDir === -1 ? -1 : 1;

        if (a < b) return -1 * orderMultiplier;
        if (a > b) return 1 * orderMultiplier;

        return 0;
      });
    }

    if (!Array.isArray(orderKeys)) throw new Error("sortArray: keys still not an array");

    // sort the array based on the keys and orders
    return orderArray.slice().sort((a, b) => {
      for (let i = 0; i < orderKeys.length; i++) {
        const order = orderDir?.[i];
        const orderMultiplier = order === "desc" || order === -1 ? -1 : 1;

        const key = orderKeys?.[i];
        if (a[key] < b[key]) return -1 * orderMultiplier;
        if (a[key] > b[key]) return 1 * orderMultiplier;
      }
      return 0;
    });
  };

  // If no keys or orders are provided, sort as a plain array
  if (!keys && !orders) return lodashOrderBy(array, null, "asc");

  // handle keys and orders as strings
  if (isStringValid(keys)) {
    const sortOrder = keys;
    const sortKey = orders;

    if (!sortKey) return lodashOrderBy(array, null, sortOrder);
    return lodashOrderBy(array, [sortKey], [sortOrder]);
  }

  if (isArray(keys)) return lodashOrderBy(array, keys, orders);
  if (isObject(keys)) return lodashOrderBy(array, Object.keys(keys), Object.values(keys));

  throw new Error("sortArray: invalid keys or orders");
}

/**
 * create a sorting function to help sort based on the needs
 * @param {string} options.sortKey
 * @param {asc,desc,1,-1} options.sortOrder
 * @param {boolean} options.numberFirst
 * @param {boolean} options.stringFirst
 * @param {boolean} options.nullishFirst
 * @returns sorted function to use within array.sort()
 */
function sortBy({ sortKey, sortOrder, numberFirst, stringFirst, nullishFirst }) {
  numberFirst = validateValue([true, false], numberFirst, true);
  stringFirst = validateValue([true, false], stringFirst, null);
  nullishFirst = validateValue([true, false], nullishFirst, false);

  // defaults to ascending
  sortOrder = sortOrder === "desc" || sortOrder === -1 ? -1 : 1;

  let sortPriority = 1;
  if (numberFirst === false) sortPriority = -1;
  if (stringFirst === true) sortPriority = -1;
  if (stringFirst === false) sortPriority = 1;

  return (a, b) => {
    const aValue = isStringValid(sortKey) ? a?.[sortKey] : a;
    const bValue = isStringValid(sortKey) ? b?.[sortKey] : b;

    // Handle nullish values for null and undefined
    if (isNullish(aValue) !== isNullish(bValue)) {
      if (isNullish(aValue)) return -1 * (nullishFirst === true ? 1 : -1); // Nullish values come later
      if (isNullish(bValue)) return 1 * (nullishFirst === true ? 1 : -1); // Nullish values come first
    }

    // Handle precedence between number and string
    if (isString(aValue) && isNumber(bValue)) return 1 * sortPriority; // Strings take precedence over numbers if stringFirst
    if (isNumber(aValue) && isString(bValue)) return -1 * sortPriority; // Numbers take precedence over strings if numberFirst
    // Handle boolean values
    if (isBoolean(aValue) && isBoolean(bValue)) return (Number(aValue) - Number(bValue)) * sortOrder;
    // Handle number values
    if (isNumber(aValue) && isNumber(bValue)) return (aValue - bValue) * sortOrder;
    // Handle string values
    if (isString(aValue) && isString(bValue)) {
      const isAAlpha = /^[A-Za-z]/.test(aValue); // Check if `a` starts with a letter
      const isBAlpha = /^[A-Za-z]/.test(bValue); // Check if `b` starts with a letter

      if (isAAlpha && !isBAlpha) return 1 * sortPriority; // Letters come before numbers
      if (!isAAlpha && isBAlpha) return -1 * sortPriority; // Numbers come after letters

      // If both are the same type (letters or numbers), use localeCompare
      return aValue.localeCompare(bValue) * sortOrder;
    }

    return 0; // Default to equality for unsupported types
  };
}

/**
 * The `unwindArray` function recursively "unwinds" or flattens nested objects and arrays within
 * a given data structure based on a specified path. It allows for deeply nested properties
 * to be expanded into a flat list of objects, with the relevant properties being copied over
 * to the top-level structure. The function can be configured to preserve empty arrays if
 * required, and will handle various data types such as objects and arrays.
 *
 * @param {Object} data - The object containing the data to be unwound.
 * @param {String} path - The path (dot-separated string) indicating the property to unwind.
 *
 * @returns {Array} - A list of unwound objects, where each object corresponds to a unique combination
 *                    of the original properties with the unwound elements.
 */
function unwindArray(data, path) {
  if (typeof data !== "object" || data === null) {
    throw new Error(`The "data" must be an array or an object.`);
  }

  if (!path) {
    throw new Error(`The "path" must be a valid dot-separated string.`);
  }

  const unwindRecursive = (dataObject, path, currPath) => {
    const pathArr = path.split(".");
    if (!currPath) currPath = pathArr[0];

    const preserveEmptyArray = true;
    const result = [];
    let isAdded = false;

    const addUnwoundObject = (unwoundObject, objectKey) => {
      Object.keys(unwoundObject).forEach((unwoundObjectKey) => {
        const newObjectCopy = {};

        Object.keys(dataObject).forEach((dataObjectKey) => {
          newObjectCopy[dataObjectKey] = dataObject[dataObjectKey];
        });

        newObjectCopy[objectKey] = unwoundObject[unwoundObjectKey];
        isAdded = true;
        result.push(newObjectCopy);
      });
    };

    Object.keys(dataObject).forEach((dataObjectKey) => {
      if (currPath !== dataObjectKey) return;

      // unwinding non-array (object)
      if (!isArray(dataObject[dataObjectKey])) {
        return addUnwoundObject(unwindRecursive(dataObject[dataObjectKey], path.replace(`${currPath}.`, "")), dataObjectKey);
      }

      // delete the array if it is empty and not needed
      if (dataObject[dataObjectKey].length === 0 && preserveEmptyArray !== true) {
        delete dataObject[dataObjectKey];
        return;
      }

      // iterate over each element in the array
      dataObject[dataObjectKey].forEach((arrayElement) => {
        addUnwoundObject(unwindRecursive(arrayElement, path.replace(`${currPath}.`, "")), dataObjectKey);
      });
    });

    if (!isAdded) result.push(dataObject);

    return result;
  };

  return unwindRecursive(data, path);
}
