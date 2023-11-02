const Redis = require("redis");
const redis = Redis.createClient();

module.exports = {
  redis,
  connect,
};

async function connect() {
  redis.on("error", (err) => console.error("redis", err));
  redis.connect();

  console.log("redis", "connected");
  return;
}
