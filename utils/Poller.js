const assert = require("node:assert");
const EventEmitter = require("node:events");

class Poller extends EventEmitter {
  constructor(func, opts = {}) {
    super();

    if (typeof func !== "function") throw new Error("Provide a promised function");

    const defaults = {
      debug: false,
      delay: 5 * 1000, // in millis
      maxLimit: -1,
      autostart: true,
      startWithDelay: false,
    };

    // setting options
    opts = typeof opts === "number" ? Object.assign(defaults, { delay: opts }) : Object.assign(defaults, opts);

    // initiating
    this.func = func;
    this.count = 0;
    this.options = opts;
    this.timeout = null;
    this.interval = Math.floor(opts.delay / 1000); // in secs
    this.continue = true;
    this.lastResponse = null;
    this.lastModified = null;
    this.instanceId = Math.random().toString(36).substring(2);
    this.debugging = Boolean(opts.debug);
    this.debug();
    this.debug("initiated");

    // auto-start
    opts.autostart && this.start();
  }

  debug(log = "") {
    if (typeof log === "boolean") {
      this.debugging = log;
      console.log(`[Poller #${this.instanceId}]`, "debugging", log ? "enabled" : "disabled");
      return this;
    }
    this.debugging && console.log(`[Poller #${this.instanceId}]`, new Date().toLocaleTimeString(), log);
  }

  cache(data = null) {
    if (data) {
      this.lastModified = new Date();
      this.lastResponse = data;
      this.debug(`saved to memory at ${this.lastModified.toISOString()}`);
    }
    return this.lastResponse;
  }

  start() {
    // clear timeout if exsits
    this.stop();
    this.debug("polling started");
    this.continue = true;
    this.options.startWithDelay ? this._waitAndExecute() : this._execute();
    return this;
  }

  stop() {
    this.debug("polling stopped");
    this.timeout && clearTimeout(this.timeout);
    this.timeout = null;
    this.continue = false;

    return this;
  }

  update(func) {
    this.func = func;
    this.instanceId = Math.random().toString(36).substring(2);

    // auto-start
    this.options.autostart && this.start();
  }

  _execute() {
    this.debug("execution started");
    const startedAt = Date.now();

    this.func()
      .then((res) => {
        this.emit("response", res, this.instanceId);

        try {
          assert.deepStrictEqual(this.cache(), res);
        } catch (err) {
          this.cache(res);
          this.emit("updated", res, this.instanceId);
        }

        return res;
      })
      .catch((err) => this.emit("error", err))
      .finally(() => {
        this.debug(`execution finished in ${Date.now() - startedAt} ms`);

        // counting...
        this.count += 1;
        this.debug(`polled: ${this.count}, maxLimit: ${this.options.maxLimit}, continue: ${this.continue}`);

        // stop after max reached or run infinite
        this.options.maxLimit >= 0 && !(this.count < this.options.maxLimit) && this.stop();

        // should be continued
        this.continue && this._waitAndExecute();
      });

    return this;
  }

  _waitAndExecute() {
    this.debug(`queued for next run in ${this.interval} sec(s)`);
    this.timeout = setTimeout(this._execute.bind(this), this.interval * 1000);
  }
}

module.exports = Poller;

// if (exec instanceof Promise) {
//   return exec.then(() => this.emit("task-finished")).catch((error) => this.emit("task-failed", error));
// } else {
//   this.emit("task-finished");
//   return exec;
// }
