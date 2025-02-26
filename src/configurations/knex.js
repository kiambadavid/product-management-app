const knex = require("knex");
const {logger} = require("../utilities/logger");
require("dotenv").config();

const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  },
});

db.on("error", (err) => {
  logger.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = { db };
