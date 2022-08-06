const connection = require('../database/mysql_connexion');
const date = require('date-and-time');


exports.getRequests = (req, res, next) => {
    let sql = `SELECT requests_friendship.id as idRequest, user_id_sender as sender, user_id_recipient as recipient, request_date, approve_date, denied_date, users.picture_url, users.lastname, users.firstname, users.email FROM requests_friendship LEFT JOIN users ON users.id = requests_friendship.user_id_sender WHERE user_id_recipient = ? AND approve_date IS NULL AND denied_date IS NULL;`;
    connection.query(
        sql, [req.user.userId], function (err, results) {
            if (err) throw err;
            if (results === undefined || results.length === 0) {
                res.status(200).json({ message: 'Vous n\'avez aucune demande d\'amitié !' });
            }
            else {
                res.status(200).json({ message: 'Vos demandes d\'amitié : ', data: results });
            }
        }
    )
}

exports.getAllFriends = (req, res, next) => {
    let sql = `SELECT sender.id as sender_user_id, sender.picture_url as sender_picture_url, sender.lastname as sender_lastname, sender.firstname as sender_firstname, sender.gender_id as sender_gender_id, sender.birthday as sender_birthday, sender.email as sender_email, sender.role_id as sender_role_id, sender.created_at as sender_created_at, sender.account_disabled as sender_account_disabled, recipient.id as recipient_user_id, recipient.picture_url as recipient_picture_url, recipient.lastname as recipient_lastname, recipient.firstname as recipient_firstname, recipient.gender_id as recipient_gender_id, recipient.birthday as recipient_birthday, recipient.email as recipient_email, recipient.role_id as recipient_role_id, recipient.created_at as recipient_created_at, recipient.account_disabled as recipient_account_disabled, requests_friendship.id as requestId, requests_friendship.request_date, requests_friendship.approve_date, requests_friendship.denied_date FROM requests_friendship LEFT JOIN users sender ON sender.id = requests_friendship.user_id_sender AND sender.account_disabled IS NULL LEFT JOIN users recipient ON recipient.id = requests_friendship.user_id_recipient AND recipient.account_disabled IS NULL WHERE (requests_friendship.user_id_recipient = ? AND requests_friendship.approve_date IS NOT NULL AND requests_friendship.denied_date IS NULL) OR (requests_friendship.user_id_sender = ? AND requests_friendship.approve_date IS NOT NULL AND requests_friendship.denied_date IS NULL) GROUP BY requestId;`;
    connection.query(
        sql, [req.user.userId, req.user.userId], function (err, results) {
            if (err) throw err;
            if (results === undefined || results.length === 0) {
                res.status(200).json({ message: 'Vous n\'avez aucun ami !', results });
            }
            else {
                res.status(200).json({ message: 'Vos amis : ', results });
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

exports.replyToRequest = (req, res, next) => {
    let sqlCheck = `SELECT * FROM requests_friendship WHERE user_id_recipient = ? AND approve_date IS NULL AND denied_date IS NULL;`;
    connection.query(
        sqlCheck, [req.user.userId], function (err, results) {
            if (err) throw err;
            if (results === undefined || results.length === 0) {
                res.status(400).json({ message: 'Vous n\'avez aucune demande d\'amitié !' });
            }
            else {
                if (req.body.response == 'accepted') {
                    console.log("accepted");
                    let now = new Date();
                    let today = date.format(now, 'YYYY-MM-DD HH:mm:ss');
                    // results[i].id
                    let sql = `UPDATE requests_friendship SET approve_date = ? WHERE user_id_sender = ?;`;
                    connection.query(
                        sql, [today, req.params.id], function (err, results) {
                            if (err) throw err;
                            console.log(results)
                            res.status(200).json({ message: 'Demande d\'amitié approuvée !' });
                        }
                    )
                } else if (req.body.response == 'refused') {
                    console.log('refused');
                    let now = new Date();
                    let today = date.format(now, 'YYYY-MM-DD HH:mm:ss');
                    let sql = `UPDATE requests_friendship SET denied_date = ? WHERE user_id_sender = ?;`;
                    connection.query(
                        sql, [today, req.params.id], function (err, results) {
                            if (err) throw err;
                            console.log(results)
                            res.status(200).json({ message: 'Demande d\'amitié refusée !' });
                        }
                    )
                }
            }
        }

    )

}

exports.search = (req, res, next) => {
    let sql = `SELECT users.id, users.picture_url, users.lastname, users.firstname, users.gender_id, users.birthday, users.email, users.password, users.role_id, users.created_at, users.account_disabled, requests_friendship.id as requestId, requests_friendship.user_id_sender as user_id_sender, requests_friendship.request_date, requests_friendship.approve_date, requests_friendship.denied_date FROM users LEFT JOIN requests_friendship ON requests_friendship.user_id_recipient = users.id WHERE user_id_sender = ? AND lastname LIKE ? OR firstname LIKE ? GROUP BY users.id;`;
    let search = '%' + req.query.search + '%';
    connection.query(
        sql, [req.user.userId, search, search], function (err, results) {
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
            if (results.affectedRows == 0) {
                res.status(400).json({ message: 'Vous n\'êtes pas ami avec cet utilisateur !' });
            }
            else if (results.affectedRows == 1) {
                res.status(200).json({ message: 'Vous n\'êtes plus ami avec cet utilisateur désormais !' });
            }
        }
    )
}

exports.cancelRequest = (req, res, next) => {
    let sql = `DELETE FROM requests_friendship WHERE user_id_sender = ? AND user_id_recipient = ? AND approve_date IS NULL AND denied_date IS NULL;`;
    connection.query(
        sql, [req.user.userId, req.params.id], function (err, results) {
            if (err) throw err;
            if (results.affectedRows == 0) {
                res.status(400).json({ message: 'Vous n\'avez pas de demande d\'amitié en cours avec cet utilisateur !' });
            }
            else if (results.affectedRows == 1) {
                console.log(results);
                res.status(200).json({ message: 'Votre demande d\'amitié a été annulée !' });
            }
        }
    )
}