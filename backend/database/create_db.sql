SET foreign_key_checks = 0;

DROP TABLE IF EXISTS user_status;

DROP TABLE IF EXISTS publications;

DROP TABLE IF EXISTS publication_history;

DROP TABLE IF EXISTS publication_user_liked;

DROP TABLE IF EXISTS comments;

DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS genders;

DROP TABLE IF EXISTS roles;

DROP TABLE IF EXISTS requests_friendship;

DROP TABLE IF EXISTS messages;

CREATE TABLE
    genders (
        id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
        gender_name VARCHAR(50)
    );

INSERT INTO genders (gender_name) VALUES ('Homme'), ('Femme');

CREATE TABLE
    roles (
        id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
        role_name VARCHAR(50)
    );

INSERT INTO roles (role_name) VALUES ('User'), ('Admin');

CREATE TABLE
    users (
        id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
        picture_url VARCHAR(255),
        lastname VARCHAR(128),
        firstname VARCHAR(128),
        gender_id INTEGER,
        FOREIGN KEY (gender_id) REFERENCES genders(id) ON DELETE RESTRICT ON UPDATE CASCADE,
        birthday DATE,
        email VARCHAR(60) NOT NULL UNIQUE,
        password VARCHAR(60) NOT NULL,
        role_id INTEGER DEFAULT 1,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
        created_at DATE,
        account_disabled BOOLEAN,
        session_id VARCHAR(255),
        userID VARCHAR(255)
    );

CREATE TABLE
    user_status (
        id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
        status_description TEXT(128)
    );

CREATE TABLE
    publications (
        id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
        content TEXT(128),
        picture TEXT(128),
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        created_at DATETIME,
        updated_at DATETIME,
        modified_by_admin BOOLEAN
    );

CREATE TABLE
    publication_history (
        id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
        publication_id INTEGER,
        FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE ON UPDATE CASCADE,
        content TEXT(128),
        picture TEXT(128),
        firstname VARCHAR(128),
        lastname VARCHAR(128),
        picture_url VARCHAR(255),
        role_id INTEGER,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        created_at DATETIME
    );

CREATE TABLE
    publication_user_liked (
        id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        publication_id INTEGER,
        FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE ON UPDATE CASCADE
    );

CREATE TABLE
    comments (
        id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        publication_id INTEGER,
        FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE ON UPDATE CASCADE,
        content TEXT,
        created_at DATETIME
    );

CREATE TABLE
    requests_friendship (
        id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id_sender INTEGER,
        user_id_recipient INTEGER,
        FOREIGN KEY (user_id_sender) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (user_id_recipient) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        request_date DATETIME,
        approve_date DATETIME,
        denied_date DATETIME
    );

CREATE TABLE
    messages (
        id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
        content TEXT,
        picture TEXT,
        sender INTEGER,
        FOREIGN KEY (sender) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        recipient INTEGER,
        FOREIGN KEY (recipient) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        created_at DATETIME,
        updated_at DATETIME,
        viewed BOOLEAN
    );

SET foreign_key_checks = 1;