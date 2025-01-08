/**
 *
 * @abstract Throttle: the original function will be called at most once per specified period.
 * @param {function} fn
 * @param {number} delay
 * @returns {function} to execute
 */
module.exports.throttle = function (fn, delay) {
  let throttled = false;

  return function () {
    if (throttled) return;

    fn.apply(this, arguments);
    throttled = true;

    setTimeout(() => {
      throttled = false;
    }, delay);
  };
};

/**
 *
 * @abstract Debounce: the original function will be called after the caller stops calling the decorated function after a specified period.
 * @param {function} fn
 * @param {number} delay
 * @returns {function} to execute
 */
module.exports.debounce = function (fn, delay) {
  let timer;
  return function () {
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, delay);
  };
};
