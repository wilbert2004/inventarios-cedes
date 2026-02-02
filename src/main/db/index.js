const db = require("./connection");
const runMigrations = require("./migrations");

runMigrations();

module.exports = db;
