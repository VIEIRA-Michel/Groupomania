const connection = require('../database/mysql_connexion');
const date = require('date-and-time');

exports.getPublicationsOfAllFriends = (req, res, next) => {
    let sql = `SELECT * FROM publications;`;
    connection.query(
        sql, function (err, results) {
            if (err) {
                console.log(err);
                res.status(500).json({ message: 'Erreur lors de la récupération des publications' });
            } else {
                res.status(200).json({ Publications: results });
            }
        }
    )
}

exports.getPublicationsOfOnePerson = (req, res, next) => {
    let sql = `SELECT * FROM publications WHERE user_id = ?;`;
    connection.query(
        sql, [req.params.id], function (err, results) {
            if (err) {
                console.log(err);
                res.status(500).json({ message: 'Erreur lors de la récupération des publications' });
            } else {
                res.status(200).json({ Publications: results });
            }
        }
    )
}


exports.createPublication = (req, res, next) => {
    let now = new Date();
    let today = date.format(now, 'YYYY-MM-DD HH:mm:ss');
    let publication = {
        content: req.body.content,
        picture: req.body.picture,
        user_id: req.user.userId,
        created_at: today

    };
    let sql = `INSERT INTO publications (content, picture, user_id, created_at) VALUES (?, ?, ?, ?);`;
    connection.query(
        sql, [publication.content, publication.picture, publication.user_id, publication.created_at], function (err, results) {
            if (err) {
                console.log(err)
                res.status(500).json({ message: 'Erreur lors de la création de la publication' });
            }
            if (!err) {
                console.log('le resultat', results);
                res.status(201).json({ message: 'Publication créée ! ' })
            }

        })
}