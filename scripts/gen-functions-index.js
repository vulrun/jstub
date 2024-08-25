const fs = require("node:fs");
const path = require("node:path");

const FUNCTIONS_DIR = path.resolve("functions/");
const FUNCTIONS_INDEX = "functions/index.js";
const FUNCTIONS_INDEX_PATH = path.resolve(FUNCTIONS_INDEX);

const functionFiles = fs
  .readdirSync(FUNCTIONS_DIR)
  .filter((file) => file.endsWith(".js"))
  .filter((file) => !file.endsWith("index.js"))
  .sort();

// collecting export statements
const allExports = [];
for (const file of functionFiles) {
  const moduleExports = require(FUNCTIONS_DIR + "/" + file);
  const exportKeys = Object.keys(moduleExports);
  const fileName = file.replace(".js", "");

  if (exportKeys.length > 0) {
    for (const expo of exportKeys) {
      allExports.push([expo, `require("./${fileName}")["${expo}"]`]);
    }
  } else if (typeof moduleExports === "function") {
    allExports.push([fileName, `require("./${fileName}")`]);
  }
}

// generating export statements
const exportStatements = allExports
  .sort()
  .map(([key, val]) => `\t${key}: ${val},`)
  .join("\n");

fs.writeFileSync(FUNCTIONS_INDEX_PATH, `module.exports = {\n${exportStatements}\n};\n`);
console.log(FUNCTIONS_INDEX, "has been generated!");
