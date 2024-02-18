/** Database config for database. */


const { Client } = require("pg");
const {DB_URI} = require("./config");
console.log('connected to db')

let db = new Client({
  connectionString: DB_URI
});

db.connect();


module.exports = db;
