const fs = require("node:fs");
const jstub = require("../functions");

// Object to hold database functions
const functions = {};

// Function to set a value in an object using a path
functions.set = function (path, value, obj) {
  let schema = obj;
  let pList = path.split(".");
  let len = pList.length;
  // Traverse the object based on the path
  for (let i = 0; i < len - 1; i++) {
    let elem = pList[`${i}`];
    if (typeof schema[`${elem}`] !== "object") {
      schema[`${elem}`] = {};
    }
    schema = schema[`${elem}`];
  }
  // Set the value at the end of the path
  schema[pList[`${len - 1}`]] = value;
};

// Function to get a value from an object using a path
functions.get = function (obj, ...data) {
  return data.reduce(function (acc, key) {
    return acc[`${key}`];
  }, obj);
};

// Function to remove a value from an object using a path
functions.remove = function (obj, path) {
  if (!obj || !path) {
    return;
  }

  if (typeof path === "string") {
    path = path.split(".");
  }

  for (var i = 0; i < path.length - 1; i++) {
    obj = obj[path[`${i}`]];

    if (typeof obj === "undefined") {
      return;
    }
  }

  delete obj[path.pop()];
};

// Function to fetch files from a directory
functions.fetchFiles = function (dbFolder, dbName) {
  if (fs.existsSync(`${dbFolder}`) === false) {
    fs.mkdirSync(`${dbFolder}`);
  }
  if (fs.existsSync(`./${dbFolder}/${dbName}.json`) === false) {
    fs.writeFileSync(`./${dbFolder}/${dbName}.json`, "{}");
  }
  return;
};

// Function to remove empty data from an object
functions.removeEmptyData = function (obj) {
  const remove = function (obj) {
    Object.keys(obj).forEach(function (key) {
      if (obj[`${key}`] && typeof obj[`${key}`] === "object") {
        remove(obj[`${key}`]);
      } else if (obj[`${key}`] === null || obj[`${key}`] === "") {
        delete obj[`${key}`];
      }
      if (typeof obj[`${key}`] === "object" && Object.keys(obj[`${key}`]).length === 0) {
        delete obj[`${key}`];
      }
    });
  };

  remove(obj);
};

// JsonDB class definition
class JsonDB {
  // Initialize with options
  constructor(options) {
    this.dbName = options["dbName"];
    this.dbFolder = options["dbFolder"];
    this.noBlankData = options["noBlankData"] ? (typeof options["noBlankData"] === "boolean" ? options["noBlankData"] : false) : false;
    this.readable = options["readable"] ? (typeof options["readable"] === "boolean" ? true : false) : false;
    functions.fetchFiles(this.dbFolder, this.dbName);
  }

  // Method to set a value in the database
  set(path, data) {
    functions.fetchFiles(this.dbFolder, this.dbName);
    if (!path) throw new TypeError(this.message["errors"]["blankName"]);
    if (!data) throw new TypeError(this.message["errors"]["blankData"]);

    const content = JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.json`, "utf8"));
    functions.set(path, data, content);

    if (this.readable) {
      fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.json`, JSON.stringify(content, null, 2));
    } else {
      fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.json`, JSON.stringify(content));
    }
    return this.get(path);
  }

  // Method to get a value from the database
  get(path) {
    if (!path) throw new TypeError(this.message["errors"]["blankName"]);

    try {
      const content = JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.json`, "utf8"));
      return functions.get(content, ...path.split("."));
    } catch (err) {
      return undefined;
    }
  }

  fetch() {
    return this.get(...arguments);
  }

  has(path) {
    if (!path) throw new TypeError(this.message["errors"]["blankName"]);

    try {
      const content = JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.json`, "utf8"));
      return functions.get(content, ...path.split(".")) ? true : false;
    } catch (err) {
      return false;
    }
  }

  delete(path) {
    functions.fetchFiles(this.dbFolder, this.dbName);
    if (!path) throw new TypeError(this.message["errors"]["blankName"]);
    if (!this.get(path)) return false;

    const content = JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.json`, "utf8"));
    functions.remove(content, path);

    if (this.noBlankData === true) {
      functions.removeEmptyData(content);
    }

    if (this.readable) {
      fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.json`, JSON.stringify(content, null, 2));
    } else {
      fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.json`, JSON.stringify(content));
    }

    return true;
  }

  add(path, number) {
    if (!path) throw new TypeError(this.message["errors"]["blankName"]);
    if (!number) throw new TypeError(this.message["errors"]["blankData"]);
    if (isNaN(number)) throw new TypeError(this.message["errors"]["blankNumber"]);

    const val = this.get(path);
    const num = isNaN(val) ? Number(number) : val + Number(number);

    this.set(path, Number(val ? num : Number(number)));
    return this.get(db);
  }

  subtract(path, number) {
    if (!path) throw new TypeError(this.message["errors"]["blankName"]);
    if (!number) throw new TypeError(this.message["errors"]["blankData"]);
    if (isNaN(number)) throw new TypeError(this.message["errors"]["blankNumber"]);

    if (this.get(path) - number < 1) {
      this.delete(path);
      return this.get(path) || 0;
    }

    if (!this.get(path)) {
      this.delete(path);
      return this.get(path) || 0;
    }

    this.set(path, this.get(path) ? (this.get(path) - Number(number) <= 1 ? 1 : (isNaN(this.get(path)) ? 1 : this.get(path) - Number(number)) || 1) : 1);
    return this.get(path);
  }

  push(path, data) {
    if (!path) throw new TypeError(this.message["errors"]["blankName"]);
    if (!data) throw new TypeError(this.message["errors"]["blankData"]);

    const arr = [];

    if (this.get(path)) {
      if (typeof this.get(path) !== "object") {
        arr = [];
      } else {
        arr = this.get(path);
      }
    }

    arr.push(data);
    this.set(path, arr);
    return this.get(path);
  }

  unpush(path, data) {
    if (!path) throw new TypeError(this.message["errors"]["blankName"]);
    if (!data) throw new TypeError(this.message["errors"]["blankData"]);

    const arr = this.get(path) || [];
    arr = arr.filter((x) => x !== data);

    this.set(path, arr);
    return this.get(path);
  }

  // Method to get a value from the database
  delByPriority(path, number) {
    if (!path) throw new TypeError(this.message["errors"]["blankData"]);
    if (!number) throw new TypeError(this.message["errors"]["blankNumber"]);
    if (isNaN(number)) throw new TypeError(this.message["errors"]["blankNumber"]);

    const content = this.get(path);
    if (!content || content.length < 1 || typeof content !== "object") {
      return false;
    }

    const neww = [];
    for (let a = 0; a < content.length; a++) {
      if (a !== number - 1) {
        neww.push(content[`${a}`]);
      }
    }

    this.set(path, neww);
    return this.get(path);
  }

  setByPriority(path, data, number) {
    if (!path) throw new TypeError(this.message["errors"]["blankData"]);
    if (!data) throw new TypeError(this.message["errors"]["blankData"]);
    if (!number) throw new TypeError(this.message["errors"]["blankNumber"]);
    if (isNaN(number)) throw new TypeError(this.message["errors"]["blankNumber"]);

    const content = this.get(path);
    if (!content || content.length < 1 || typeof content !== "object") {
      return false;
    }

    let neww = [];
    for (let a = 0; a < content.length; a++) {
      let val = content[`${a}`];

      if (a === number - 1) {
        neww.push(data);
      } else {
        neww.push(val);
      }
    }

    this.set(path, neww);
    return this.get(path);
  }

  /**
   *
   * @returns all records
   */
  all() {
    const content = JSON.parse(fs.readFileSync(`./${this.dbFolder}/${this.dbName}.json`, "utf8"));
    return content;
  }

  /**
   *
   * @returns true, if all records deleted successfully
   */
  deleteAll() {
    fs.writeFileSync(`./${this.dbFolder}/${this.dbName}.json`, JSON.stringify({}));
    return true;
  }

  /**
   * @args {data, pipeline}
   * @args {pipeline}
   * @returns aggregated data
   */
  findAll() {
    if (arguments.length < 1) throw new Error("at least pipeline is needed");

    let data, pipeline;
    if (arguments.length === 1) {
      data = this.all();
      pipeline = arguments[0];
    } else if (arguments.length === 2) {
      data = this.get(arguments[0]);
      pipeline = arguments[1];
    }

    return jstub.findAll(data, [].concat(pipeline));
  }
}

module.exports = JsonDB;
