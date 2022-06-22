SET foreign_key_checks = 0;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(40) UNIQUE,
    password VARCHAR(60)
);




