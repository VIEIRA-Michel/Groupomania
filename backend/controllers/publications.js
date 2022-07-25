const connection = require('../database/mysql_connexion');
const date = require('date-and-time');

exports.getAllPublications = (req, res, next) => {
    let sql = `SELECT * FROM users 
                   LEFT JOIN publications ON users.id = publications.user_id AND users.account_disabled IS NULL 
                   LEFT JOIN requests_friendship senders ON users.id = senders.user_id_sender 
                   LEFT JOIN requests_friendship recipients ON users.id = recipients.user_id_recipient 
                   WHERE users.id = ? OR (senders.user_id_recipient = ? AND senders.approve_date IS NOT NULL) OR (recipients.user_id_sender = ? AND recipients.approve_date IS NOT NULL);`;
    connection.query(
        sql, [req.user.userId, req.user.userId, req.user.userId], function (err, results) {
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

exports.likePublication = (req, res, next) => {
    let like = {
        user_id: req.user.userId,
        publication_id: req.params.id
    };
    let sqlSearch = `SELECT * FROM publication_user_liked WHERE user_id = ? AND publication_id = ?;`;
    connection.query(
        sqlSearch, [like.user_id, like.publication_id], function (err, results) {
            console.log('faut check ca', results);
            if (err) {
                console.log(err)
                res.status(500).json({ message: 'Erreur lors de la recherche du like' });
            } else {
                if (results.length === 0) {
                    let sql = `INSERT INTO publication_user_liked (user_id, publication_id) VALUES (?, ?);`;
                    connection.query(
                        sql, [like.user_id, like.publication_id], function (err, results) {
                            if (err) {
                                console.log(err)
                                res.status(500).json({ message: 'Erreur lors de la création du like' });
                            }
                            if (!err) {
                                res.status(200).json({ message: 'Like ajouté ! ' })
                            }

                        }
                    )
                } else {
                    let sqlDeleteLike = `DELETE FROM publication_user_liked WHERE user_id = ? AND publication_id = ?;`;
                    connection.query(
                        sqlDeleteLike, [like.user_id, like.publication_id], function (err, results) {
                            if (err) {
                                console.log(err)
                                res.status(500).json({ message: 'Erreur lors de la suppression du like' });
                            }
                            if (!err) {
                                res.status(200).json({ message: 'Like supprimé ! ' })
                            }
                        }
                    )
                }
            }
        }
    )
}


exports.getOnePublication = (req, res, next) => {
    let sql = `SELECT * FROM publications WHERE id = ?;`;
    connection.query(
        sql, [req.params.id], function (err, results) {
            if (err) {
                console.log(err);
                res.status(500).json({ message: 'Erreur lors de la récupération de la publication' });
            } else {
                res.status(200).json({ Publication: results });
            }
        }
    )
}
