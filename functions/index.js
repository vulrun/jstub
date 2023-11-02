const cases = require("./cases.func");
const cryptos = require("./cryptos.func");
const dates = require("./dates.func");
const misc = require("./misc.func");
const objects = require("./objects.func");
const parsings = require("./parsings.func");
const strings = require("./strings.func");

module.exports = {
  ...cases,
  ...cryptos,
  ...dates,
  ...misc,
  ...objects,
  ...parsings,
  ...strings,
};
