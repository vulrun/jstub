module.exports = {
  normalCase,
  titleCase,
  prettyCase,
};

function normalCase(str) {
  return String(str).replace(/[^a-z0-9]/gi, " ");
}

function titleCase(str) {
  return normalCase(str)
    .toLowerCase()
    .replace(/\b[a-z]/g, (v) => v.toUpperCase());
}

function prettyCase(str) {
  if (typeof str === "string" && /^[A-Z_]+$/.test(str)) {
    str = titleCase(str);
  }
  return str;
}
