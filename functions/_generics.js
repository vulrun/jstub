module.exports = {
  isUndefined,
  isArray,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isNull,
  isJson,
  isEmpty,
};

function isUndefined(data) {
  return data === undefined;
}
function isNull(data) {
  return data === null;
}
function isObject(data) {
  return String(data) === String({});
}
function isArray(data) {
  return Array.isArray(data);
}
function isString(data) {
  return typeof data === "string";
}
function isNumber(data) {
  return typeof data === "number";
}
function isBoolean(data) {
  return data === false || data === true;
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
