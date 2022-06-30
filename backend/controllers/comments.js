const connection = require('../database/mysql_connexion');
const date = require('date-and-time');

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