module.exports.toDecimals = (val, decimal = 2) => {
  const base = Math.pow(10, decimal);
  return Math.round(val * base) / base;
};
