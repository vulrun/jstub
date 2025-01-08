const titleCase = require("./titleCase");

module.exports.prettyCase = function prettyCase(str) {
  if (typeof str === "string" && /^[A-Z_]+$/.test(str)) {
    str = titleCase(str);
  }
  return str;
};
