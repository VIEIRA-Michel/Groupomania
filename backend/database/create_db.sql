SET foreign_key_checks = 0;

DROP TABLE IF EXISTS user_status;

DROP TABLE IF EXISTS publications;

DROP TABLE IF EXISTS publication_user_liked;

DROP TABLE IF EXISTS comments;

DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS genders;

DROP TABLE IF EXISTS roles;

DROP TABLE IF EXISTS requests_friendship;

CREATE TABLE genders (
    id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    gender_name VARCHAR(50)
);

INSERT INTO genders (gender_name) VALUES ('Homme'), ('Femme');

CREATE TABLE roles (
    id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50)
);

INSERT INTO roles (role_name) VALUES ('User'), ('Admin');

CREATE TABLE users (
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
    session_id VARCHAR(255)
);

insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/recusandaevoluptatumitaque.png?size=50x50&set=set1', 'Tumasian', 'Christos', 'ctumasian0@census.gov', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-10-07');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/voluptasiddolores.png?size=50x50&set=set1', 'Placide', 'Jaclin', 'jplacide1@yahoo.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-10-04');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/veniamaccusamusvoluptates.png?size=50x50&set=set1', 'Moorcraft', 'Drucy', 'dmoorcraft2@desdev.cn', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-04-02');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/culpaautemut.png?size=50x50&set=set1', 'O''Corrin', 'Cliff', 'cocorrin3@stanford.edu', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-02-26');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/utistenam.png?size=50x50&set=set1', 'Merry', 'Rozelle', 'rmerry4@themeforest.net', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-08-30');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/utnesciuntqui.png?size=50x50&set=set1', 'Keneford', 'Kingsly', 'kkeneford5@lulu.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-05-27');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/insuntdelectus.png?size=50x50&set=set1', 'Faircliffe', 'Gardy', 'gfaircliffe6@discovery.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-04-16');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/dictaautnostrum.png?size=50x50&set=set1', 'Shellsheere', 'Manfred', 'mshellsheere7@loc.gov', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-12-15');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/asperioresquidemaccusamus.png?size=50x50&set=set1', 'Ketcher', 'Vaughan', 'vketcher8@illinois.edu', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-03-20');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/sitprovidenttenetur.png?size=50x50&set=set1', 'Pfeffel', 'Julietta', 'jpfeffel9@yahoo.co.jp', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-09-14');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/asperioresdebitishic.png?size=50x50&set=set1', 'Nockalls', 'Fawnia', 'fnockallsa@wisc.edu', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-10-17');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/dictavelrerum.png?size=50x50&set=set1', 'Lyptrit', 'Pip', 'plyptritb@gnu.org', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-06-05');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/minimaestsit.png?size=50x50&set=set1', 'Farncombe', 'Domenico', 'dfarncombec@myspace.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-12-31');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/consequaturquodillum.png?size=50x50&set=set1', 'Iacobo', 'Gay', 'giacobod@smh.com.au', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-08-20');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/omnisrepudiandaequi.png?size=50x50&set=set1', 'Bartkowiak', 'Ellen', 'ebartkowiake@drupal.org', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-06-03');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/utautamet.png?size=50x50&set=set1', 'Bernuzzi', 'Skippie', 'sbernuzzif@cdc.gov', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-07-19');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/inventorequodea.png?size=50x50&set=set1', 'McPartling', 'Adelbert', 'amcpartlingg@elegantthemes.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmOv', '2022-04-20');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/cupiditatemolestiaetotam.png?size=50x50&set=set1', 'Ruddiforth', 'Meredith', 'mruddiforthh@networkadvertising.org', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-12-25');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/aliastotamnihil.png?size=50x50&set=set1', 'Warrior', 'Rhianna', 'rwarriori@mediafire.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-02-12');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/etinipsam.png?size=50x50&set=set1', 'Able', 'Tiertza', 'tablej@foxnews.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-08-17');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/providentipsamagnam.png?size=50x50&set=set1', 'Stranger', 'Diahann', 'dstrangerk@ebay.co.uk', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-02-20');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/idinvoluptas.png?size=50x50&set=set1', 'Allabush', 'Edlin', 'eallabushl@mail.ru', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-02-20');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/quosrepellenduseos.png?size=50x50&set=set1', 'Scopes', 'Fred', 'fscopesm@so-net.ne.jp', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-09-23');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/quisquamimpeditut.png?size=50x50&set=set1', 'Maxsted', 'Andres', 'amaxstedn@kickstarter.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-02-28');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/saepeevenietenim.png?size=50x50&set=set1', 'Pleasance', 'Garnette', 'gpleasanceo@hubpages.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-08-13');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/sapienteinventoreet.png?size=50x50&set=set1', 'Origan', 'Lisle', 'loriganp@issuu.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-09-15');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/etprovidentrepellendus.png?size=50x50&set=set1', 'Zoppie', 'Graham', 'gzoppieq@trellian.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-05-20');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/nonnecessitatibusqui.png?size=50x50&set=set1', 'Jodlkowski', 'Isidro', 'ijodlkowskir@mlb.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-08-11');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/quisquamnamaccusantium.png?size=50x50&set=set1', 'Cakes', 'Burl', 'bcakess@ezinearticles.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-10-17');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/auteaaut.png?size=50x50&set=set1', 'Waber', 'Nesta', 'nwabert@eepurl.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-10-22');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/voluptateametvoluptatibus.png?size=50x50&set=set1', 'Crummay', 'Britni', 'bcrummayu@miibeian.gov.cn', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-08-07');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/maximevoluptatumillum.png?size=50x50&set=set1', 'Sheather', 'Claresta', 'csheatherv@oakley.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-07-08');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/nulladoloresoccaecati.png?size=50x50&set=set1', 'McCrohon', 'Raff', 'rmccrohonw@wunderground.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-01-04');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/adipisciutsit.png?size=50x50&set=set1', 'Verny', 'Jone', 'jvernyx@tuttocitta.it', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-12-21');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/omnissequirecusandae.png?size=50x50&set=set1', 'Guyers', 'Rik', 'rguyersy@mail.ru', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-08-08');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/quiasapienteipsa.png?size=50x50&set=set1', 'Matijasevic', 'Marleah', 'mmatijasevicz@msn.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-01-27');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/teneturanimiharum.png?size=50x50&set=set1', 'Broddle', 'Ynes', 'ybroddle10@rambler.ru', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-01-19');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/sapienteutquidem.png?size=50x50&set=set1', 'Halpen', 'Bucky', 'bhalpen11@bloglovin.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-05-25');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/nonmodiquia.png?size=50x50&set=set1', 'Pothergill', 'Martino', 'mpothergill12@diigo.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-04-17');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/magnamdeseruntrepudiandae.png?size=50x50&set=set1', 'Doley', 'Iggie', 'idoley13@etsy.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-07-02');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/minimavoluptatemet.png?size=50x50&set=set1', 'Dowderswell', 'Vanya', 'vdowderswell14@theatlantic.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-05-14');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/veniamliberoesse.png?size=50x50&set=set1', 'Iacobucci', 'Korey', 'kiacobucci15@mozilla.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-05-02');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/quammodieveniet.png?size=50x50&set=set1', 'Baxster', 'Myriam', 'mbaxster16@amazon.co.uk', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-05-14');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/ipsumsaepetenetur.png?size=50x50&set=set1', 'Yeates', 'Selig', 'syeates17@list-manage.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-04-15');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/veritatisimpeditest.png?size=50x50&set=set1', 'Burgiss', 'Perry', 'pburgiss18@cdbaby.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-10-25');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/voluptateminventoreperferendis.png?size=50x50&set=set1', 'Adaway', 'Jany', 'jadaway19@geocities.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-03-12');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/itaqueidaccusantium.png?size=50x50&set=set1', 'O''Dea', 'Dianne', 'dodea1a@businesswire.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-04-02');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/assumendarerumdignissimos.png?size=50x50&set=set1', 'Giberd', 'Sergei', 'sgiberd1b@lulu.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2022-03-28');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/etomnisquod.png?size=50x50&set=set1', 'Couvet', 'Alaine', 'acouvet1c@typepad.com', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-11-26');
insert into users (picture_url, lastname, firstname, email, password, created_at) values ('https://robohash.org/repellendusdolordolore.png?size=50x50&set=set1', 'Puckrin', 'Derek', 'dpuckrin1d@japanpost.jp', '$2b$10$bR8K6oxe8C26gP.r1EhzJOudHL6LKxfrZnNPjC/qgYXdcV59.0GmO', '2021-12-23');


CREATE TABLE user_status (
    id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    status_description TEXT(128)
);

CREATE TABLE publications (
    id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    content TEXT(128),
    picture TEXT(128),
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at DATETIME,
    updated_at DATETIME
);

CREATE TABLE publication_user_liked (
    id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    publication_id INTEGER,
    FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE comments (
    id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    publication_id INTEGER,
    FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE ON UPDATE CASCADE,
    content TEXT,
    created_at DATETIME
);

CREATE TABLE requests_friendship (
    id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id_sender INTEGER,
    user_id_recipient INTEGER,
    FOREIGN KEY (user_id_sender) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id_recipient) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    request_date DATETIME,
    approve_date DATETIME,
    denied_date DATETIME
);

SET foreign_key_checks = 1;
