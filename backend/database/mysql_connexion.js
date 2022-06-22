const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'groupomania',
  password: 'a$a$a$'
});

module.exports = connection;