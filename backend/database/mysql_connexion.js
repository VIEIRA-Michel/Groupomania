const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'groupomania',
  password: ''
});

module.exports = connection;