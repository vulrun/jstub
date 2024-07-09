const ms = require("ms");

module.exports.MemCache = new Map();

module.exports.TtlCache = function () {
  const data = new Map();
  const timers = new Map();

  this.has = (k) => data.has(k);
  this.get = (k) => data.get(k);
  this.set = (k, v, ttl = 0) => {
    ttl = String(ttl || "0");
    if (timers.has(k)) clearTimeout(timers.get(k));
    const timer = setTimeout(() => this.delete(k), ms(ttl));
    timers.set(k, timer);
    data.set(k, v);
    return v;
  };
  this.delete = (k) => {
    if (timers.has(k)) clearTimeout(timers.get(k));
    timers.delete(k);
    data.delete(k);
    return;
  };
  this.clear = () => {
    timers.values().forEach(clearTimeout);
    timers.clear();
    data.clear();
    return;
  };

  return this;
};

class LruCache extends Map {
  constructor(iterable, limit) {
    if (typeof iterable === "number") {
      limit = iterable;
      iterable = undefined;
    }

    super(iterable);
    this.limit = Number(limit) || 100;
  }

  get(key) {
    if (!super.has(key)) return null;

    // move the accessed item to the end of Map to mark it as recently used
    const value = super.get(key);
    super.delete(key);
    super.set(key, value);

    return value;
  }
  set(key, value) {
    if (super.has(key)) {
      // if value exists, delete the old cache
      super.delete(key);
    }
    if (super.size >= this.limit) {
      // remove the least recently used item (first item in the map)
      const oldestKey = super.keys().next().value;
      super.delete(oldestKey);
    }

    super.set(key, value);
    return value;
  }
}

module.exports.LruCache = LruCache;

// will plan this
// function memoize(fn, delAfter = 1000000) {
//   const missing = Symbol("missing");
//   let cache = missing;
//   return async () => {
//     if (cache === missing) {
//        cache = Promise.resolve(fn());
//        setTimeout(() => cache = missing, delAfter);
//     }
//     return await cache;
//   }
// }
// const foo = memoize(() => fetch("https://foo/bar", { method: " POST", body: JSON.stringify({bar:1}) }))

// // Will only do a single fetch.
// console.log(await foo(), await foo())

// class CustomError extends Error {
//     constructor(code, message) {
//       message = message || messages?.error_message?.[code];
//       super(message);
//       // this.name = this.constructor.name;
//       this.code = code;
//       this.error = message;
//       Error.captureStackTrace(this, this.constructor);
//     }
//   }
