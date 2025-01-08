(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    // asynchronous module definition
    define(factory);
  } else if (typeof module === "object" && module.exports) {
    // CommonJS, NodeJS
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.jstub = factory();
  }
})(typeof self !== "undefined" ? self : this, () => require("./functions"));
