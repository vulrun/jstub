/**
 *
 * @abstract Throttle: the original function will be called at most once per specified period.
 * @param {function} fn
 * @param {number} delay
 * @returns {function} to execute
 */
module.exports.throttle = function throttle(fn, delay) {
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
module.exports.debounce = function debounce(fn, delay) {
  let timer;
  return function () {
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, delay);
  };
};

/**
 * Memoizes the result of a function and caches it for a specified duration.
 * After the duration expires, the cache is invalidated, and the function is re-executed.
 *
 * @param {Function} fn - The function to memoize. Can be synchronous or asynchronous.
 * @param {number} cacheDuration - The duration (in milliseconds) to keep the cache.
 * @returns {Function} - A memoized version of the provided function.
 */
module.exports.memoize = function memoize(fn, cacheDuration = 3600e3) {
  // Symbol used to indicate cache is missing
  const MISSING_CACHE = Symbol("missing_cache");

  let cache = MISSING_CACHE;
  let cacheTimestamp = 0;

  return async function (...args) {
    const isCacheExpired = Date.now() - cacheTimestamp > cacheDuration;

    if (cache === MISSING_CACHE || isCacheExpired) {
      try {
        cache = fn(...args);

        if (!(cache instanceof Promise)) {
          cache = Promise.resolve(cache);
        }

        cacheTimestamp = Date.now();
      } catch (error) {
        cache = MISSING_CACHE;
        throw error;
      }
    }

    return await cache;
  };
};
