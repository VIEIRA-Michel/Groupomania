const connection = require('../database/mysql_connexion');

exports.createComment = (req, res, next) => {
    let comment = {
        user_id: req.user.userId,
        publication_id: req.params.id,
        content: req.body.content,
    };
    let sql = `INSERT INTO comments (user_id, publication_id, content, created_at) VALUES (?, ?, ?, NOW());`;
    connection.query(
        sql, [comment.user_id, comment.publication_id, comment.content], function (err, results) {
            if (err) {
                console.log(err)
                res.status(500).json({ message: 'Erreur lors de la création du commentaire' });
            }
            if (!err) {
                sql = `SELECT publications.id as publication_id, publications.content as publication_content, picture, publications.user_id, publications.created_at as publication_created, updated_at as publication_updated_at, users.picture_url, users.lastname, users.firstname, users.email, users.role_id, users.account_disabled, comments.id as comment_id, comments.user_id as comment_user_id, comments.publication_id as comment_publication_id, comments.content as comment_content, comments.created_at as comment_created_at FROM comments LEFT JOIN users ON users.id = comments.user_id AND users.account_disabled IS NULL LEFT JOIN publications ON publications.id = comments.publication_id WHERE comments.id = ?;`;
                connection.query(
                    sql, [results.insertId], function (err, results) {
                        if (err) {
                            console.log(err)
                            res.status(500).json({ message: 'Erreur lors de la création du commentaire' });
                        }
                        if (!err) {
                            res.status(201).json({ message: 'Commentaire créé ! ', data: results });
                        }
                    }
                );
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

exports.getNumberOfComments = (req, res, next) => {
    let sql = `SELECT COUNT(id) FROM comments WHERE publication_id = ?;`
    connection.query(
        sql, [req.params.id], function (err, results) {
            if (err) {
                console.log(err)
                res.status(500).json({ message: 'Erreur lors de la récupération du nombre de commentaires' });
            } else {
                res.status(200).json({ message: 'Nombre de commentaires récupéré ! ', data: results[0]['COUNT(id)'] });
            }
        }
    )
};

exports.getAllCommentsFromPublication = (req, res, next) => {
    let sql = `SELECT publications.id as publication_id, publications.content as publication_content, picture, publications.user_id, publications.created_at as publication_created, updated_at as publication_updated_at, users.picture_url, users.lastname, users.firstname, users.email, users.role_id, users.account_disabled, comments.id as comment_id, comments.user_id as comment_user_id, comments.publication_id as comment_publication_id, comments.content as comment_content, comments.created_at as comment_created_at FROM comments 
    LEFT JOIN users ON users.id = comments.user_id AND users.account_disabled IS NULL LEFT JOIN publications ON publications.id = comments.publication_id WHERE comments.publication_id = ?;`;
    connection.query(
        sql, [req.params.id], function (err, results) {
            if (err) {
                console.log(err)
                res.status(500).json({ message: 'Erreur lors de la récupération des commentaires' });
            } else {
                const numOfResults = results.length;
                let limitValue = parseInt(req.query.limit);
                let from = parseInt(req.query.from);
                sql = `SELECT publications.id as publication_id, publications.content as publication_content, picture, publications.user_id, publications.created_at as publication_created, updated_at as publication_updated_at, users.picture_url, users.lastname, users.firstname, users.email, users.role_id, users.account_disabled, comments.id as comment_id, comments.user_id as comment_user_id, comments.publication_id as comment_publication_id, comments.content as comment_content, comments.created_at as comment_created_at FROM comments 
                LEFT JOIN users ON users.id = comments.user_id AND users.account_disabled IS NULL LEFT JOIN publications ON publications.id = comments.publication_id WHERE comments.publication_id = ? LIMIT ? OFFSET ?;`;
                connection.query(
                    sql, [req.params.id, limitValue, from], function (err, results) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({ message: 'Erreur lors de la récupération des commentaires' });
                        } else {
                            res.status(200).json({ comments: results, numOfResults: numOfResults });
                        }
                    }
                )
            }
        }
    )
}