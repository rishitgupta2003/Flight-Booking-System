const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  PORT: process.env.PORT,
  FLIGHT_SERVICE: process.env.FLIGHT_SERVICE,
  MESSAGE_QUEUE: process.env.MESSAGE_QUEUE,
  JWT_SECRET: process.env.JWT_SECRET
};
