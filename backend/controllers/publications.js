const connection = require('../database/mysql_connexion');
const date = require('date-and-time');
const fs = require('fs');

exports.getAllPublications = (req, res, next) => {
    const resultsPerPage = 5;
    let sql = `SELECT publications.id as publication_id, content, picture, user_id, publications.created_at as publication_created, updated_at, 
    users.id, users.picture_url, users.lastname, users.firstname, users.gender_id, users.birthday, users.email, users.role_id, users.created_at, users.account_disabled, 
    senders.id as sender_requestId, senders.user_id_sender as sender_userId, senders.user_id_recipient as sender_recipientId, senders.request_date as sender_requestDate, senders.approve_date as sender_approveDate, senders.denied_date as sender_deniedDate, 
    recipients.id as recipient_requestId, recipients.user_id_sender as recipient_senderId , recipients.user_id_recipient as recipient_userId, recipients.request_date as recipient_requestDate, recipients.approve_date as recipient_approveDate, recipients.denied_date as recipient_deniedDate FROM publications 
    LEFT JOIN users ON users.id = publications.user_id AND users.account_disabled IS NULL LEFT JOIN requests_friendship senders ON users.id = senders.user_id_sender LEFT JOIN requests_friendship recipients ON users.id = recipients.user_id_recipient WHERE users.id = ? OR (senders.user_id_recipient = ? AND senders.approve_date IS NOT NULL) OR (recipients.user_id_sender = ? AND recipients.approve_date IS NOT NULL) GROUP BY publication_id;`;
    connection.query(
        sql, [req.user.userId, req.user.userId, req.user.userId], function (err, results) {
            if (err) {
                console.log(err);
                res.status(500).json({ message: 'Erreur lors de la récupération des publications' });
            } else {
                if (results.length <= 0) {
                    res.status(200).json({ message: 'Aucune publication' });
                } else {
                    const numOfResults = results.length;
                    const numOfPages = Math.ceil(numOfResults / resultsPerPage);
                    let page = req.query.page ? Number(req.query.page) : 1;
                    if (page > numOfPages) {
                        res.send('/?page=' + encodeURIComponent(numOfPages));
                    } else if (page < 1) {
                        res.send('/?page=' + encodeURIComponent('1'));
                    }
                    const startingLimit = (page - 1) * resultsPerPage;
                    sql = `SELECT publications.id as publication_id, content, picture, user_id, publications.created_at as publication_created, updated_at, 
                           users.id, users.picture_url, users.lastname, users.firstname, users.gender_id, users.birthday, users.email, users.role_id, users.created_at, users.account_disabled, 
                           senders.id as sender_requestId, senders.user_id_sender as sender_userId, senders.user_id_recipient as sender_recipientId, senders.request_date as sender_requestDate, senders.approve_date as sender_approveDate, senders.denied_date as sender_deniedDate, 
                           recipients.id as recipient_requestId, recipients.user_id_sender as recipient_senderId , recipients.user_id_recipient as recipient_userId, recipients.request_date as recipient_requestDate, recipients.approve_date as recipient_approveDate, recipients.denied_date as recipient_deniedDate FROM publications 
                           LEFT JOIN users ON users.id = publications.user_id AND users.account_disabled IS NULL LEFT JOIN requests_friendship senders ON users.id = senders.user_id_sender LEFT JOIN requests_friendship recipients ON users.id = recipients.user_id_recipient WHERE users.id = ? OR (senders.user_id_recipient = ? AND senders.approve_date IS NOT NULL) OR (recipients.user_id_sender = ? AND recipients.approve_date IS NOT NULL) GROUP BY publication_id LIMIT ${startingLimit}, ${resultsPerPage};`
                    connection.query(
                        sql, [req.user.userId, req.user.userId, req.user.userId], function (err, results) {
                            if (err) {
                                console.log(err);
                                res.status(500).json({ message: 'Erreur lors de la récupération des publications' });
                            }
                            let iterator = (page - 5) < 1 ? 1 : page - 5;
                            let endingLink = (iterator + 9) <= numOfPages ? (iterator + 9) : page + (numOfPages);
                            if (endingLink < (page + 4)) {
                                iterator -= (page + 4) - numOfPages;
                            }
                            res.status(200).json({ Publications: results, page: page, numOfPages: numOfPages, numOfResults: numOfResults });

                        }
                    )
                }
            }
        }
    )
};
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
        user_id: req.user.userId,
        created_at: today,
    };
    if (req.file) {
        publication.picture = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    };
    let sql = `INSERT INTO publications (content, picture, user_id, created_at) VALUES (?, ?, ?, ?);`;
    connection.query(
        sql, [publication.content, publication.picture, publication.user_id, publication.created_at], function (err, results) {
            if (err) {
                console.log(err)
                res.status(500).json({ message: 'Erreur lors de la création de la publication' });
            }
            if (!err) {
                sql = `SELECT id AS publication_id, content, picture, user_id, created_at as publication_created, updated_at FROM publications WHERE id = ?;`;
                connection.query(
                    sql, [results.insertId], function (err, results) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({ message: 'Erreur lors de la récupération de la publications' });
                        } else {
                            res.status(201).json({ message: 'Publication créée !', data: results })
                        }
                    }
                )
            }

        })
}

exports.updatePublication = (req, res, next) => {
    let publication = req.file ?
        {
            ...req.body,
            picture: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        } : { ...req.body };

    let sql = `UPDATE publications SET content = ?, picture = ?, updated_at = NOW() WHERE id = ?;`;
    connection.query(
        sql, [publication.content, publication.picture, req.params.id], function (err, results) {
            if (err) {
                console.log(err)
                res.status(500).json({ message: 'Erreur lors de la modification de la publication' });
            } else {
                res.status(200).json({ message: 'Publication modifiée ! ' })
            }
        }
    )
}

exports.deletePublication = (req, res, next) => {
    let sql = `SELECT * FROM publications WHERE id = ?;`;
    connection.query(
        sql, [req.params.id], function (err, results) {
            if (err) {
                console.log(err);
                res.status(500).json({ message: 'Erreur lors de la récupération de la publication' });
            } else {
                if (results.length === 0) {
                    res.status(404).json({ message: 'Publication non trouvée' });
                } else {
                    if (results[0].picture == null) {
                        sql = `DELETE FROM publications WHERE id = ?;`;
                        connection.query(
                            sql, [req.params.id], function (err, results) {
                                if (err) {
                                    console.log(err);
                                    res.status(500).json({ message: 'Erreur lors de la suppression de la publication' });
                                } else {
                                    res.status(200).json({ message: 'Publication supprimée ! ' })
                                }
                            }
                        )
                    } else {
                        const filename = results[0].picture.split('/images/')[1];
                        fs.unlink(`images/${filename}`, () => {
                            sql = `DELETE FROM publications WHERE id = ?;`;
                            connection.query(
                                sql, [req.params.id], function (err, results) {
                                    if (err) {
                                        console.log(err);
                                        res.status(500).json({ message: 'Erreur lors de la suppression de la publication' });
                                    } else {
                                        res.status(200).json({ message: 'Publication supprimée ! ' })
                                    }
                                }
                            )
                        })
                    }
                }
            }
        }
    )
}

exports.likePublication = (req, res, next) => {
    let like = {
        user_id: req.user.userId,
        publication_id: req.params.id
    };
    let sql = `SELECT * FROM publication_user_liked WHERE user_id = ? AND publication_id = ?;`;
    connection.query(
        sql, [like.user_id, like.publication_id], function (err, results) {
            if (err) {
                console.log(err);
                res.status(500).json({ message: 'Erreur lors de la récupération de la publication' });
            } else {
                if (results.length === 0) {
                    sql = `INSERT INTO publication_user_liked (user_id, publication_id) VALUES (?, ?);`;
                    connection.query(
                        sql, [like.user_id, like.publication_id], function (err, results) {
                            if (err) {
                                console.log(err);
                                res.status(500).json({ message: 'Erreur lors de la récupération de la publication' });
                            } else {
                                res.status(200).json({ message: 'Publication likée ! ', results: results, liked: true });
                            }
                        }
                    )
                } else {
                    sql = `DELETE FROM publication_user_liked WHERE user_id = ? AND publication_id = ?;`;
                    connection.query(
                        sql, [like.user_id, like.publication_id], function (err, results) {
                            if (err) {
                                console.log(err)
                                res.status(500).json({ message: 'Erreur lors de la suppression du like' });
                            }
                            if (!err) {
                                res.status(200).json({ message: 'Like supprimé ! ', results: results, liked: false })
                            }
                        }
                    )
                }
            }
        }
    )
}


exports.getLikes = (req, res, next) => {
    let sql = `SELECT publication_user_liked.id as idLike, publication_user_liked.user_id as user_id_who_liked, publication_user_liked.publication_id as publication_id, users.id as user_id, users.picture_url, users.lastname as user_lastname, users.firstname as user_firstname, users.account_disabled as account_disabled FROM publication_user_liked LEFT JOIN users ON users.id = publication_user_liked.user_id AND users.account_disabled IS NULL WHERE publication_user_liked.publication_id = ?;`;
    connection.query(
        sql, [req.params.id], function (err, results) {
            if (err) {
                console.log(err);
                res.status(500).json({ message: 'Erreur lors de la récupération des likes' });
            } else {
                res.status(200).json({ message: 'Likes récupérés ! ', data: results, idPublication: req.params.id });
            }
        }
    )
}