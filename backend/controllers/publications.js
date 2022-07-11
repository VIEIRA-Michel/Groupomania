const connection = require('../database/mysql_connexion');
const date = require('date-and-time');

exports.getAllPublications = (req, res, next) => {
    let sqlVerification = `SELECT * FROM requests_friendship WHERE user_id_sender = ? OR user_id_recipient = ? AND approve_date IS NOT NULL;`;
    // let sqlTest = `SELECT * FROM users INNER JOIN publications ON users.id = publications.user_id AND users.account_disabled IS NULL INNER JOIN requests_friendship senders ON users.id = senders.user_id_sender INNER JOIN requests_friendship recipients ON users.id = recipients.user_id_recipient`;
    let arrayId = [];
    let arrayId2 = [];
    connection.query(
        sqlVerification, [req.user.userId, req.user.userId], function (err, results) {
            if (err) {
                return next(err);
            }
            for (let i = 0; i < results.length; i++) {
                if (results[i].user_id_sender === req.user.userId) {
                    arrayId.push(results[i].user_id_recipient);
                } else if (results[i].user_id_recipient === req.user.userId) {
                    arrayId.push(results[i].user_id_sender);
                }
            }
            let sqlVerificationTwo = `SELECT * FROM users WHERE id IN(?) AND account_disabled IS NULL;`;
            connection.query(
                sqlVerificationTwo, [arrayId], function (err, results) {
                    if (err) {
                        return next(err);
                    }
                    for (let i = 0; i < results.length; i++) {
                        arrayId2.push(results[i].id);
                    }
                    let sql = `SELECT * FROM publications WHERE user_id IN(?);`;
                    connection.query(
                        sql, [arrayId2], function (err, results) {
                            if (err) {
                                console.log(err);
                                res.status(500).json({ message: 'Erreur lors de la récupération des publications' });
                            } else {
                                res.status(200).json({ Publications: results });
                            }
                        }
                    )
                }
            )
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
