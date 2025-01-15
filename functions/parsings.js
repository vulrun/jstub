module.exports = {
  safeJsonParse,
  parseEmail,
  parseUrlLocation,
  parseUri,
};

/**
 *
 * @param {string} data
 * @returns {object} null or data
 * @example safeJsonParse('{"key":"value"}')
 * @example safeJsonParse(null)
 *
 */
function safeJsonParse(data) {
  try {
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
}

/**
 *
 * @param {string} input
 * @returns {object}
 * @example parseEmail("testuser@gmail.com")
 * @example parseEmail("test.user@gmail.com")
 * @example parseEmail("user+label@domain.com")
 * @example parseEmail("test.user@googlemail.com")
 */
function parseEmail(input) {
  const regex = /^([a-z0-9]+(?:[\_\.\-][a-z0-9]+)*)(\+[a-z0-9\_\.\-]+)?@((?:[a-z0-9\-]+\.)+[a-z]{2,})$/i;

  const match = String(input).toLowerCase().match(regex);
  if (!match) return null;

  let [email, uname, plus, domain] = match;
  if (domain === "gmail.com" || domain === "googlemail.com") {
    email = uname.replace(/\./g, "") + "@" + domain;
  }
  return { email, uname, plus, domain, toString: () => email };
}

/**
 *
 * @param {string} href
 * @returns {object}
 * @example parseUrlLocation("https://example.com/path?query=1#hash")
 */
function parseUrlLocation(href) {
  if (typeof href !== "string") throw new Error("parseUrlLocation: 1st argument must be a valid string");

  const match = href.match(/^([^\:]+)\:\/?\/?(([^\:\/\?\#]*)(?:\:([0-9]+))?)([\/]{0,1}[^\?\#]*)(\?[^\#]*|)(\#.*|)$/im);
  if (!match) return null;

  return {
    origin: `${match[1]}://${match[2]}`,
    href: href,
    protocol: match[1],
    host: match[2],
    hostname: match[3],
    port: match[4],
    pathname: match[5],
    search: match[6],
    hash: match[7],
  };
}

/**
 * parseUri - Parses a URI string into its components or converts an object to a URI string.
 *
 * @param {string|Object} inp - URI string to parse or object to stringify.
 * @returns {Object|string} - URI object if parsing, URI string if stringifying.
 */
function parseUri(inp) {
  const parseQS = (inp) => {
    try {
      if (!inp || typeof inp !== "string") return {};

      inp = inp.replace(/\&/g, '","').replace(/\=/g, '":"');
      return JSON.parse(`{"${inp}"}`, (key, val) => (key === "" ? val : decodeURIComponent(val)));
    } catch (err) {
      return Object.fromEntries(new URLSearchParams(search));
    }
  };
  const detachStart = (str, needle = ",") => {
    if (!str || typeof str !== "string") throw new Error("1st argument must be a valid string");

    const arr = String(str).split(needle);
    return [arr[0], arr.slice(1).join(needle)];
  };
  const detachEnd = (str, needle = ",") => {
    if (!str || typeof str !== "string") throw new Error("1st argument must be a valid string");

    const arr = String(str).split(needle);
    return [arr.slice(0, -1).join(needle), arr[arr.length - 1]];
  };

  this.stringify = (obj) => {
    let str = "";

    if (obj.protocol) str += obj.protocol + "://";
    if (obj.user) {
      str += encodeURIComponent(obj.user);
      if (obj.pass) {
        str += ":" + encodeURIComponent(obj.pass);
      }
      str += "@";
    }

    if (obj.host) str += obj.host;
    if (obj.port) str += ":" + obj.port;
    if (obj.path) str += "/" + obj.path;
    if (obj.pathname) str += "/" + obj.pathname;
    if (obj.query) str += "?" + new URLSearchParams(obj.query);

    return str;
  };

  this.parse = (str) => {
    str = String(str);
    // seperate hash
    const [p1, hash] = /\#/.test(str) ? detachEnd(str, "#") : [str];
    // seperate query
    const [p2, query] = /\?/.test(p1) ? detachEnd(p1, "?") : [p1];
    // seperate protocol
    const [protocol, p3] = /\:\/\//.test(p2) ? detachStart(p2, "://") : [, p2];
    // seperate path
    const [p4, path] = /\//.test(p3) ? detachStart(p3, "/") : [p3, ""];
    // seperate auth & hostname
    const [auth, hostname] = /\@/.test(p4) ? detachEnd(p4, "@") : [, p4];
    // separate host & port
    const [host, port] = /\:/.test(hostname) ? detachStart(hostname, ":") : [hostname];
    // separate user & pass
    let [user, pass] = /\:/.test(auth) ? detachStart(auth, ":") : [auth];
    if (user) user = decodeURIComponent(user);
    if (pass) pass = decodeURIComponent(pass);

    return {
      href: str,
      protocol,
      auth,
      user,
      pass,
      host,
      port,
      hostname,
      pathname: path,
      query,
      queryObj: parseQS(query),
      hash,
    };
  };

  if (String(inp) === String({})) {
    return this.stringify(inp);
  } else {
    return this.parse(inp);
  }
}
