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

exports.updatePublication = (req, res, next) => {
    const publicationObject = { ...req.body }
    console.log('publicationObject', publicationObject);
    let now = new Date();
    let today = date.format(now, 'YYYY-MM-DD HH:mm:ss');
    let publication = {
        content: req.body.content,
        picture: req.body.picture,
        updated_at: today
    };
    let sql = `UPDATE publications SET content = ?, picture = ?, updated_at = ? WHERE id = ?;`;
    connection.query(
        sql, [publication.content, publication.picture, publication.updated_at, req.params.id], function (err, results) {
            if (err) {
                console.log(err)
                res.status(500).json({ message: 'Erreur lors de la modification de la publication' });
            } else {
                console.log(results);
                res.status(200).json({ message: 'Publication modifiée ! ' })
            }
        }
    )
}

exports.deletePublication = (req, res, next) => {
    let sql = `DELETE FROM publications WHERE id = ?;`;
    connection.query(
        sql, [req.params.id], function (err, results) {
            if (err) {
                console.log(err)
                res.status(500).json({ message: 'Erreur lors de la suppression de la publication' });
            } else {
                console.log(results);
                res.status(200).json({ message: 'Publication supprimée ! ' })
            }
        }
    )
}

exports.createComment = (req, res, next) => {
    let now = new Date();
    let today = date.format(now, 'YYYY-MM-DD HH:mm:ss');
    let comment = {
        user_id: req.user.userId,
        publication_id: req.params.id,
        content: req.body.content,
        created_at: today
    };
    let sql = `INSERT INTO comments (user_id, publication_id, content, created_at) VALUES (?, ?, ?, ?);`;
    connection.query(
        sql, [comment.user_id, comment.publication_id, comment.content, comment.created_at], function (err, results) {
            if (err) {
                console.log(err)
                res.status(500).json({ message: 'Erreur lors de la création du commentaire' });
            }
            if (!err) {
                console.log('le resultat', results);
                res.status(201).json({ message: 'Commentaire créé ! ' })
            }

        }
    )
}

exports.deleteComment = (req, res, next) => {
    let sql = `DELETE FROM comments WHERE id = ?;`;
    connection.query(
        sql, [req.params.id], function (err, results) {
            if (err) {
                console.log(err)
                res.status(500).json({ message: 'Erreur lors de la suppression du commentaire' });
            } else {
                console.log(results);
                res.status(200).json({ message: 'Commentaire supprimé ! ' })
            }
        }
    )
}