const { trimStr } = require("./strings");

module.exports = {
  isUndefined,
  isNull,
  isArray,
  isObject,
  isString,
  isStringValid,
  isNumber,
  isBoolean,
  isNullish,
  isDate,
  isJson,
  isEmpty,
};

function isUndefined(data) {
  return data === undefined;
}

function isNull(data) {
  return data === null;
}

function isArray(data) {
  return Array.isArray(data);
}

function isObject(data) {
  return String(data) === String({});
}

function isString(data) {
  return typeof data === "string";
}

function isStringValid(data) {
  return isString(data) && trimStr(data).length > 0;
}

function isNumber(data) {
  if (typeof data === "number" && !isNaN(data)) return true;
  if (typeof data === "string" && !isNaN(data) && !isNaN(parseFloat(data))) return true;

  return false;
}

function isBoolean(data) {
  return data === false || data === true;
}

function isNullish(data) {
  return data === undefined || data === null;
}

function isDate(date) {
  if (isNullish(date)) return false;
  if (isNumber(date)) date = Number(date);

  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
}

function isJson(data) {
  try {
    JSON.parse(data);
  } catch (e) {
    return false;
  }
  return true;
}

function isEmpty(data) {
  if (isNull(data) || isUndefined(data)) return true;
  if (isObject(data)) return Object.keys(data).length === 0;
  if (isArray(data)) return data.length === 0;
  if (isString(data)) return data.length === 0;
  if (isNumber(data)) return !isFinite(data);
  if (!data) return true;
  return false;
}
