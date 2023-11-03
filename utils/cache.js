const ms = require("ms");
const LRU = require("lru-cache");

module.exports = {
  MemCache: new Map(),
  TtlCache: new TtlCache(),
  LruCache: () => new LruCache(...arguments),
};

function LruCache({ max, maxAge }, options) {
  max = max || 500;
  maxAge = maxAge || "6h";

  const cache = new LRU({
    max: max,
    maxAge: maxAge === "string" ? ms("6h") : +maxAge,
    ...options,
  });

  return cache;
}

function TtlCache() {
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
}

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
