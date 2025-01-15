const { isNullish } = require("./dataType");
const { sortArray } = require("./objects");

module.exports = {
  deepCopy,
  safeEval,
  delay,
  calcAge,
  calcKms,
  maskString,
  replaceParams,
  validateValue,
  applyAggregation,
  formatBytes,
  extractStackTrace,
};

/**
 * Deep copies a given object or array, handling circular references.
 *
 * This function creates a deep copy of the input `data`, ensuring that circular references
 * are handled by marking them as "[Circular]" instead of causing infinite loops.
 *
 * @param {Object | Array} data - The data to be deep copied.
 * @returns {Object | Array} - A new deep copy of the input data.
 */
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

/**
 * safeEval - A secure alternative to `eval` that evaluates JavaScript code
 * from a string, blocking unsafe constructs and handling errors gracefully.
 *
 * @param {string} str - The JavaScript code to evaluate.
 * @returns {*} - Evaluation result or `null` if an error occurs.
 * @throws {TypeError} - If the input is not a string.
 */
function safeEval(str) {
  try {
    if (typeof str !== "string") throw new TypeError("Input must be a string");
    if (/eval\(/i.test(str)) throw new TypeError("'eval' not allowed");
    if (/new\s+Function\s*\(/i.test(str)) throw new TypeError("'Function' not allowed");

    return Function(`"use strict"; ${str}; `)();
  } catch (error) {
    if (["ReferenceError", "TypeError", "Error"].includes(error.constructor.name)) throw error;
    throw new SyntaxError("Unable to evaluate");
  }
}

/**
 * Delays the execution for a given number of milliseconds.
 *
 * This function returns a Promise that resolves after the specified delay.
 *
 * @param {number} ms - The number of milliseconds to delay.
 * @returns {Promise} - A promise that resolves after the delay.
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculates the age based on the provided date of birth (dob).
 *
 * This function calculates the age in years from the provided date of birth.
 * It assumes that the date of birth is in a valid format (e.g., 'YYYY-MM-DD').
 *
 * @param {string | Date} dob - The date of birth, either as a string or Date object.
 * @returns {number} - The calculated age in years.
 */
function calcAge(dob) {
  return Math.abs(new Date(new Date() - new Date(dob)).getUTCFullYear() - 1970);
}

/**
 * Calculates the distance (in kilometers) between two geographical points.
 *
 * This function uses the Haversine formula to calculate the great-circle distance between
 * two points on the Earth's surface, given their latitude and longitude in degrees.
 *
 * @param {number} lat1 - Latitude of the first point (in degrees).
 * @param {number} lon1 - Longitude of the first point (in degrees).
 * @param {number} lat2 - Latitude of the second point (in degrees).
 * @param {number} lon2 - Longitude of the second point (in degrees).
 * @returns {number} - The distance between the two points in kilometers.
 */
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

/**
 * Masks a string by replacing parts of it with 'x' characters.
 *
 * This function masks a string based on its length:
 * 1. If the string is less than or equal to 2 characters, it fully masks the string.
 * 2. If the string length is less than 10, it masks the beginning and keeps the last visible characters.
 * 3. If the string length is greater than 10, it masks the middle part and keeps the first and last visible parts.
 *
 * @param {string} str - The string to mask.
 * @returns {string} - The masked string.
 */
function maskString(str) {
  str = String(str || "").trim();

  if (str.length === 0) return "";
  if (str.length <= 2) return "x".repeat(str.length);

  // If string length is < 10, mask from the start
  if (str.length < 10) {
    const visibleLen = Math.floor(str.length / 2);
    const maskedPart = "x".repeat(str.length - visibleLen);
    const visiblePart = str.slice(-visibleLen);
    return maskedPart + visiblePart;
  }

  // If string length > 10, mask from the middle
  const visibleLen = Math.floor(str.length / 2);
  // ensure visibleLen is always even and smaller than 10
  const adjustedLen = Math.min(10, visibleLen % 2 === 0 ? visibleLen : visibleLen - 1);

  return str.slice(0, adjustedLen / 2) + "x".repeat(str.length - adjustedLen) + str.slice(-(adjustedLen / 2));
}

/**
 * Replaces placeholders in a string (or JSON) with corresponding parameters.
 *
 * This function replaces placeholders of the form `$1`, `$2`, ..., `$n` in the given
 * string or JSON (stringified) with values from the `params` array.
 *
 * @param {Array | string} params - The list of parameters to replace placeholders with.
 * @param {string | Object} data - The string or JSON object with placeholders to replace.
 * @returns {string | Object} - The data with placeholders replaced by corresponding parameters.
 */
function replaceParams(params, data) {
  params = [].concat(params);

  // json support added
  if (typeof data !== "string") data = JSON.stringify(data);

  // replacing each params
  params.forEach((itm, idx) => (data = data.replaceAll(`$${idx + 1}`, itm)));

  try {
    return JSON.parse(data);
  } catch (err) {
    return data;
  }
}

/**
 * Validates if the input value exists within the allowed values list.
 * If the input is valid (exists in the list), returns the input value.
 * If invalid or no match, returns the default value.
 *
 * @param {Array} allowedValues - An array of acceptable values.
 * @param {*} inputValue - The value to be validated.
 * @param {*} defaultValue - The default value to return if the input is invalid.
 * @returns {*} The input value if valid, otherwise the default value.
 */
function validateValue(allowedValues, inputValue, defaultValue) {
  // Ensure allowedValues is a valid array
  if (!Array.isArray(allowedValues)) return defaultValue;

  // Handle edge case of empty allowedValues array
  if (allowedValues.length === 0) return defaultValue;

  // Check if the inputValue is in the allowedValues array
  return allowedValues.includes(inputValue) ? inputValue : defaultValue;
}

/**
 * Applies an aggregation pipeline to an array of data.
 *
 * This function processes an array of data through a series of stages defined by the pipeline.
 * Each stage represents an operation that modifies the data. The supported stages include:
 *
 * 1. `find`: Filters the data based on specified conditions. It supports operators such as:
 *    - `$eq`: Equal to a specific value.
 *    - `$neq`: Not equal to a specific value.
 *    - `$in`: Value must be in an array of values.
 *    - `$nin`: Value must not be in an array of values.
 *    - `$gte`: Greater than or equal to a specific value.
 *    - `$lte`: Less than or equal to a specific value.
 * 2. `sort`: Sorts the data based on one or more fields. Supports ascending (`1`) or descending (`-1`) order.
 * 3. `limit`: Limits the number of items in the resulting array.
 * 4. `skip`: Skips the first `n` items in the array.
 *
 * The pipeline is applied sequentially, with each operation modifying the data before passing it to the next stage.
 *
 * @param {Array} data - The array of objects to apply the aggregation pipeline to.
 * @param {Array} pipeline - The pipeline to apply to the data, consisting of an array of stages.
 *    Each stage can be an array or an object, where:
 *      - Array format: [operation, ...args]
 *      - Object format: {operation: args}
 * @returns {Array} - The data after applying all stages of the pipeline.
 *
 * @throws {Error} If the `data` parameter is not provided or is not an array, or if the `pipeline` is not an array.
 */
function applyAggregation(data, pipeline) {
  if (!data) throw new Error("[data] is required");
  if (!Array.isArray(pipeline)) throw new Error("[pipeline] must be an array");

  // If the pipeline is empty, return the original data
  if (!pipeline.length) return data;

  const findFilter = (item, query) => (key) => {
    if (query[key] && query[key].$gte !== undefined) return item[key] >= query[key].$gte;
    if (query[key] && query[key].$gt !== undefined) return item[key] > query[key].$gt;
    if (query[key] && query[key].$lte !== undefined) return item[key] <= query[key].$lte;
    if (query[key] && query[key].$lt !== undefined) return item[key] < query[key].$lt;
    if (query[key] && query[key].$eq !== undefined) return item[key] === query[key].$eq;
    if (query[key] && query[key].$neq !== undefined) return item[key] !== query[key].$not;
    if (query[key] && query[key].$in !== undefined) return query[key].$in.includes(item[key]);
    if (query[key] && query[key].$nin !== undefined) return !query[key].$nin.includes(item[key]);

    // Basic equality match
    return item[key] === query[key];
  };

  for (let stage of pipeline) {
    const [operation, criteria] = Array.isArray(stage) ? stage : Object.entries(stage)[0];

    switch (operation) {
      case "find":
        if (typeof criteria === "object") {
          data = data.filter((item) => {
            // check for every key condition in the criteria
            return Object.keys(criteria).every((key) => {
              return findFilter(item, criteria)(key);
            });
          });
        }
        break;

      case "sort":
        if (typeof criteria === "object") {
          data = sortArray(data, criteria);
        }
        break;

      case "skip":
        if (typeof criteria === "number") {
          data = data.slice(criteria);
        }
        break;

      case "limit":
        if (typeof criteria === "number") {
          data = data.slice(0, criteria);
        }
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  return data;
}

/**
 * Converts a byte size into a human-readable string.
 *
 * @param {number} byteSize - The byte size to convert.
 * @param {Object} [options={}] - Optional settings to customize the conversion.
 * @param {number} [options.decimalPlaces=2] - Number of decimal places to include in the result.
 * @param {boolean} [options.useBinary=false] - If true, uses binary units (KiB, MiB, etc.). Defaults to SI units (KB, MB, etc.).
 * @param {boolean} [options.compact=false] - If true, uses compact unit symbols (e.g., "M" instead of "MB").
 *
 * @returns {string} - The formatted byte size in human-readable form.
 *
 * @throws {Error} - Throws an error if byteSize is negative, nullish, or invalid.
 */

function formatBytes(byteSize, options = {}) {
  const { decimalPlaces = 2, useBinary = false, compact = false } = options;

  const unitsSI = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const unitsBinary = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  const units = useBinary ? unitsBinary : unitsSI;

  if (isNullish(byteSize)) throw new Error("Byte size cannot be nullish");
  if (byteSize < 0) throw new Error("Byte size cannot be negative");
  if (byteSize === 0) return `0 ${units[0]}`;

  const factor = useBinary ? 1024 : 1000;
  const uIndex = Math.floor(Math.log(byteSize) / Math.log(factor));
  byteSize = parseFloat(byteSize / Math.pow(factor, uIndex));

  if (compact) {
    const shortUnits = { KB: "K", MB: "M", GB: "G", TB: "T", PB: "P", EB: "E", ZB: "Z", YB: "Y", KiB: "Ki", MiB: "Mi", GiB: "Gi", TiB: "Ti", PiB: "Pi", EiB: "Ei", ZiB: "Zi", YiB: "Yi" };

    return `${byteSize.toFixed(decimalPlaces)} ${shortUnits[units[uIndex]] || units[uIndex]}`;
  }

  return `${byteSize.toFixed(decimalPlaces)} ${units[uIndex]}`;
}

/**
 * Extracts and returns the stack trace from an error object.
 * If no stack trace is available, returns a default message.
 *
 * @param {Error} error - The error object to extract the stack trace from.
 * @returns {Array} - An array of strings representing the stack trace, or a message if no stack trace is available.
 */
function extractStackTrace(error) {
  if (!(error instanceof Error)) {
    throw new Error("Input must be an instance of Error");
  }

  if (!error?.stack) return ["Error: No stack trace available"];

  const stackLines = error.stack.split("\n");
  const cleanedStack = stackLines.map((line) => line.trim()).filter((line) => line !== "");

  if (cleanedStack.length === 0) {
    return ["Error: No valid stack trace available"];
  }

  return cleanedStack;
}
