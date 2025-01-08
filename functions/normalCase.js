/**
 * removes all charactera expect alpha-numerics
 * @param {string}
 * @returns {string}
 * @example
 *
 * normalCase('some-random-characters123')
 * // => some random characters123
 */

function normalCase(str) {
  return String(str).replace(/[^a-z0-9]/gi, " ");
}

module.exports = normalCase;
