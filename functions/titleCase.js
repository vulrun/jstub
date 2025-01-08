const normalCase = require("./normalCase");

module.exports.titleCase = function titleCase(str) {
  return normalCase(str)
    .toLowerCase()
    .replace(/\b[a-z]/g, (v) => v.toUpperCase());
};
