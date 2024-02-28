const winston = require("winston");
require("winston-mongodb");

// configure winston
winston.configure({
  transports: [
    new winston.transports.Console(),
    new winston.transports.MongoDB({
      db: process.env.MONGO_URL,
      collection: "_logs",
      options: {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      },
    }),
  ],
});

module.exports = {
  logger: winston,
  middleware,
};

function middleware(req, res, next) {
  res._log = winston.info;
  res._err = winston.error;
  next();
}
