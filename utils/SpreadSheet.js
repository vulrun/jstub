const lo = require("lodash");
const { google } = require("googleapis");
const cache = require("./cache");
const { getObjPropValue } = require("../functions");
class SpreadSheet {
  constructor(sheetId, tabName, keyFile) {
    this.sheetId = sheetId;
    this.tabName = tabName;
    this.keyFile = keyFile;
    this.client = null;
    this.coll = [];
    this.data = [];
    this.pipeline = [];
    this.headers = [];
    this.options = {
      parsing: true,
    };
  }

  async load() {
    const cacheAge = getObjPropValue(arguments, "0.cacheAge");
    // handling cache
    const cacheKey = `${this.sheetId}:${this.tabName}`;
    if (cacheAge && cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    // handling authorization for spreadsheet
    const auth = new google.auth.GoogleAuth({
      keyFile: this.keyFile,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();
    this.client = google.sheets({ version: "v4", auth: authClient });

    // fetching records
    const { data } = await this.client.spreadsheets.values.get({
      spreadsheetId: this.sheetId,
      range: `${this.tabName}`,
      majorDimension: "ROWS",
      valueRenderOption: "UNFORMATTED_VALUE",
    });

    // make collection
    this.coll = this.valuesToCollection(data);
    this.data = JSON.parse(JSON.stringify(this.coll));
    // storing data in cache
    if (cacheAge) {
      console.log(cacheKey, cacheAge);
      cache.set(cacheKey, JSON.parse(JSON.stringify(this.coll)), cacheAge || "30 secs");
    }
    return this;
  }
  valuesToCollection({ values }) {
    const rows = [];
    const rawRows = values || [];
    this.headers = rawRows.shift();

    rawRows.forEach((row) => {
      const rowData = {};
      row.forEach((val, idx) => {
        const key = this.headers[idx];
        rowData[key] = val;
      });
      rows.push(rowData);
    });

    return rows;
  }

  find() {
    this.pipeline.push(["find", ...arguments]);
    return this;
  }
  sort() {
    this.pipeline.push(["sort", ...arguments]);
    return this;
  }
  skip() {
    switch (arguments.length) {
      case 2:
        this.pipeline.push(["skip", arguments[0]]);
        this.pipeline.push(["limit", arguments[1]]);
        break;

      case 1:
        this.pipeline.push(["skip", ...arguments]);
        break;
    }
    return this;
  }
  limit() {
    switch (arguments.length) {
      case 2:
        this.pipeline.push(["skip", arguments[1]]);
        this.pipeline.push(["limit", arguments[0]]);
        break;

      case 1:
        this.pipeline.push(["limit", ...arguments]);
        break;
    }
  }
  project() {
    this.pipeline.push(["project", ...arguments]);
    return this;
  }
  async exec(...args) {
    console.log(...args);
    await this.load(...args);
    if (!this.pipeline.length) return this.data;

    for (let operation of this.pipeline) {
      const [todo, ...args] = operation;

      switch (todo) {
        case "find":
          this.data = lo.filter(this.data, args[0]);
          break;

        case "sort":
          const keys = Object.keys(args[0]);
          if (keys.length) {
            const values = Object.values(args[0]).map((i) => (i > 0 ? "asc" : "desc"));
            this.data = lo.orderBy(this.data, keys, values);
          }
          break;

        case "skip":
          this.data = this.data.slice(args[0]);
          break;

        case "limit":
          this.data = this.data.slice(0, args[0]);
          break;
      }
    }

    return this.data;
  }

  async update() {
    await this.load();
    const [filter, update] = arguments;
    const index = lo.findIndex(this.coll, filter);
    const range = `${index + 2}:${index + 2}`;

    const { data: updated } = await this.client.spreadsheets.values.update({
      spreadsheetId: this.sheetId,
      range: `${this.tabName}!${range}`,
      valueInputOption: this.options.parsing ? "USER_ENTERED" : "RAW",
      resource: {
        majorDimension: "ROWS",
        values: [this._values(this.coll[index], update)],
      },
    });

    return updated;
  }
  async insert() {
    await this.load();
    let [data] = arguments;

    data = [].concat(data);
    const { data: inserted } = await this.client.spreadsheets.values.append({
      spreadsheetId: this.sheetId,
      range: `${this.tabName}`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      resource: {
        majorDimension: "ROWS",
        values: data.map(this._values),
      },
    });

    return inserted;
  }
  async delete() {
    return null;
  }
  async bulkUpdate(coll) {
    const values = [].concat(
      this.headers,
      ...coll.map((itm) => {
        return this._values(itm, coll);
      })
    );

    const { data: updated } = await this.client.spreadsheets.values.update({
      spreadsheetId: this.sheetId,
      range: `${this.tabName}`,
      valueInputOption: "RAW",
      resource: { values: [this.headers, ...values] },
    });

    return updated;
  }

  _values() {
    const obj = Object.assign({}, ...arguments);
    return this.headers.map((i) => obj[i] || "");
  }
}

module.exports = SpreadSheet;
