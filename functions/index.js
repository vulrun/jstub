const cases = require("./cases.func");
const cryptos = require("./cryptos.func");
const dates = require("./dates.func");
const misc = require("./misc.func");
const objects = require("./objects.func");
const parsings = require("./parsings.func");
const strings = require("./strings.func");

const jstub = {
  ...cases,
  ...cryptos,
  ...dates,
  ...misc,
  ...objects,
  ...parsings,
  ...strings,
};

if (typeof define === "function" && define.amd) {
  define(function () {
    return jstub;
  });
} else if (typeof module === "object" && module.exports) {
  module.exports = jstub;
} else {
  $.jstub = jstub;
}
