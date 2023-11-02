const { Sequelize, DataTypes } = require("sequelize");

module.exports = Singleton();

function Singleton() {
  let instance;

  async function connect(url) {
    if (!url) throw new Error("mongo url not found");

    instance = new Sequelize(url, {
      logging: false,
    });

    try {
      await instance.authenticate();
      console.log(instance.options.dialect, "connected");
    } catch (err) {
      console.error("sequelize", err?.message);
    }
    return;
  }

  function model(tableName, schema) {
    if (!tableName) throw new Error("tableName is missing");

    schema = schema || {};

    return instance.define(tableName, schema, {
      tableName: tableName,
      timestamps: false,
    });
  }

  return {
    DataTypes,
    Sequelize,
    client: instance,
    connect,
    model,
  };
}
