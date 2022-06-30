const connection = require('../database/mysql_connexion');
const date = require('date-and-time');


exports.getRequests = (req, res, next) => {
    let sql = `SELECT * FROM requests_friendship WHERE user_id_recipient = ? AND approve_date IS NULL;`;
    connection.query(
        sql, [req.user.userId], function (err, results) {
            if (err) throw err;
            if (results === undefined || results.length === 0) {
                res.status(200).json({ message: 'Vous n\'avez aucune demande d\'amitié !' });
            }
            else {
                res.status(200).json({ message: 'Vos demandes d\'amitié : ', results });
            }
        }
    )
}


exports.sendRequest = (req, res, next) => {
    let sqlSearch = `SELECT * FROM requests_friendship WHERE user_id_sender = ? AND user_id_recipient = ? OR user_id_sender = ? AND user_id_recipient = ?;`;
    connection.query(
        sqlSearch, [req.user.userId, req.params.id, req.params.id, req.user.userId], function (err, results) {
            if (err) throw err;
            if (results === undefined || results.length === 0) {
                let now = new Date();
                let today = date.format(now, 'YYYY-MM-DD HH:mm:ss');
                let sql = `INSERT INTO requests_friendship (user_id_sender, user_id_recipient, request_date) VALUES (?, ?, ?);`;
                connection.query(
                    sql, [req.user.userId, req.params.id, today], function (err, results) {
                        if (err) throw err;
                        res.status(200).json({ message: 'Votre demande d\'amitié a été envoyée !' });
                    }
                )
            }
            else {
                res.status(200).json({ message: 'Vous avez déjà une demande d\'amitié en cours avec cet utilisateur !' });
            }
        }
    )
}

exports.approveRequest = (req, res, next) => {
    if (req.body.response === 'accepted') {
        let now = new Date();
        let today = date.format(now, 'YYYY-MM-DD HH:mm:ss');
        let sql = `UPDATE requests_friendship SET approve_date = ? WHERE id = ?;`;
        connection.query(
            sql, [today, req.params.id], function (err, results) {
                if (err) throw err;
                res.status(200).json({ message: 'Demande d\'amitié approuvée !' });
            }
        )
    } else if (req.body.response === 'refused') {
        let sql = `DELETE FROM requests_friendship WHERE id = ?;`;
        connection.query(
            sql, [req.params.id], function (err, results) {
                if (err) throw err;
                res.status(200).json({ message: 'Demande d\'amitié refusée !' });
            }
        )
    }
}

exports.search = (req, res, next) => {
    let sql = `SELECT * FROM users WHERE lastname LIKE ? OR firstname LIKE ?;`;
    let search = '%' + req.body.search + '%';
    connection.query(
        sql, [search, search], function (err, results) {
            if (err) throw err;

            if (results === undefined || results.length === 0) {
                res.status(200).json({ message: 'Aucun résultat ! ' });
            } else {
                if (results.length === 1) {
                    res.status(200).json({ message: '1 résultat correspond à votre recherche !', results });
                } else {
                    res.status(200).json({ message: `${results.length} résultats correspondent à votre recherche !`, results });
                }

            }
        }
    )
}

exports.deleteFriend = (req, res, next) => {
    let sql = `DELETE FROM requests_friendship WHERE user_id_sender = ? AND user_id_recipient = ? AND approve_date IS NOT NULL OR user_id_sender = ? AND user_id_recipient = ? AND approve_date IS NOT NULL;`;
    connection.query(
        sql, [req.user.userId, req.params.id, req.params.id, req.user.userId], function (err, results) {
            if (err) throw err;
            if(results.affectedRows == 0) {
                res.status(400).json({ message: 'Vous n\'êtes pas ami avec cet utilisateur !' });
            }
            else if (results.affectedRows == 1) {
                res.status(200).json({ message: 'Vous n\'êtes plus ami avec cet utilisateur désormais !' });
            }
        }
    )
}
