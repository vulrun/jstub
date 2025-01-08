const fs = require("node:fs");
const path = require("node:path");

const algs = [
  {
    algorithm: "ChaCha20-Poly1305",
    ivLength: 12,
    keyLength: 32,
    authTagLength: 16,
    hasAadSupport: true,
  },
  {
    algorithm: "aes-{{KEY_BIT_LENGTH}}-gcm",
    ivLength: 12,
    keyLength: [16, 24, 32],
    authTagLength: 16,
    hasAadSupport: true,
  },
  {
    algorithm: "aes-{{KEY_BIT_LENGTH}}-cbc",
    ivLength: 16,
    keyLength: [16, 24, 32],
    hasAadSupport: false,
  },
  {
    algorithm: "aes-{{KEY_BIT_LENGTH}}-ecb",
    ivLength: 0,
    keyLength: [16, 24, 32],
    hasAadSupport: false,
  },
  {
    algorithm: "aes-{{KEY_BIT_LENGTH}}-ctr",
    ivLength: 16,
    keyLength: [16, 24, 32],
    hasAadSupport: false,
  },
  {
    algorithm: "aes-{{KEY_BIT_LENGTH}}-cfb",
    ivLength: 16,
    keyLength: [16, 24, 32],
    hasAadSupport: false,
  },
  {
    algorithm: "aes-{{KEY_BIT_LENGTH}}-ofb",
    ivLength: 16,
    keyLength: [16, 24, 32],
    hasAadSupport: false,
  },
];

const algorithms = [];

for (const alg of algs) {
  for (const key of [].concat(alg.keyLength)) {
    algorithms.push({
      ...alg,
      keyLength: key,
      algorithm: String(alg.algorithm)
        .replaceAll("{{KEY_BIT_LENGTH}}", key * 8)
        .toLowerCase(),
      hasAadSupport: alg.hasAadSupport === true,
      authTagLength: alg.authTagLength || -1,
    });
  }
}

const OUTPUT_FILE = "data/cipherAlgorithms.json";
const fullPath = path.resolve(OUTPUT_FILE);

fs.writeFileSync(fullPath, JSON.stringify(algorithms));
console.log(OUTPUT_FILE, "has been generated!");
