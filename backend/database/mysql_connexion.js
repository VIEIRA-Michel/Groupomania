const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  database: 'groupomania',
  password: '$Pyth0n$'
});

module.exports = connection;