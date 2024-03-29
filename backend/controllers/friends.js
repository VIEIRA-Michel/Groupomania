const connection = require('../database/mysql_connexion');


// Cette fonction va nous permettre de récupérer les demandes d'amitiés reçues en attente de réponse
exports.getRequests = (req, res, next) => {
    let sql = `SELECT requests_friendship.id as idRequest, user_id_sender as sender, user_id_recipient as recipient, request_date, approve_date, denied_date, users.picture_url, users.lastname, users.firstname, users.email, users.session_id, users.userID FROM requests_friendship LEFT JOIN users ON users.id = requests_friendship.user_id_sender WHERE user_id_recipient = ? AND approve_date IS NULL AND denied_date IS NULL;`;
    connection.query(
        sql, [req.user.userId], function (err, results) {
            if (err) {
                res.status(500).json({ message: 'Erreur lors de la récupération des demandes d\'amitié !' })
            } else {
                if (results === undefined || results.length === 0) {
                    res.status(200).json({ message: 'Vous n\'avez aucune demande d\'amitié !' })
                } else {
                    res.status(200).json({ message: 'Vos demandes d\'amitié : ', results })
                }
            }
        }
    )
};

// Cette fonction va nous permettre de récupérer tous nos amis
exports.getAllFriends = (req, res, next) => {
    let sql = `SELECT sender.id as sender_user_id, sender.picture_url as sender_picture_url, sender.lastname as sender_lastname, sender.firstname as sender_firstname, sender.gender_id as sender_gender_id, sender.birthday as sender_birthday, sender.email as sender_email, sender.role_id as sender_role_id, sender.created_at as sender_created_at, sender.account_disabled as sender_account_disabled, sender.session_id as sender_session_id, sender.userID as sender_userID, recipient.id as recipient_user_id, recipient.picture_url as recipient_picture_url, recipient.lastname as recipient_lastname, recipient.firstname as recipient_firstname, recipient.gender_id as recipient_gender_id, recipient.birthday as recipient_birthday, recipient.email as recipient_email, recipient.role_id as recipient_role_id, recipient.created_at as recipient_created_at, recipient.account_disabled as recipient_account_disabled, recipient.session_id as recipient_session_id, recipient.userID as recipient_userID, requests_friendship.id as requestId, requests_friendship.request_date, requests_friendship.approve_date, requests_friendship.denied_date FROM requests_friendship LEFT JOIN users sender ON sender.id = requests_friendship.user_id_sender AND sender.account_disabled IS NULL LEFT JOIN users recipient ON recipient.id = requests_friendship.user_id_recipient AND recipient.account_disabled IS NULL WHERE (requests_friendship.user_id_recipient = ? AND requests_friendship.approve_date IS NOT NULL AND requests_friendship.denied_date IS NULL) OR (requests_friendship.user_id_sender = ? AND requests_friendship.approve_date IS NOT NULL AND requests_friendship.denied_date IS NULL) GROUP BY requestId;`;
    connection.query(
        sql, [req.user.userId, req.user.userId], function (err, results) {
            if (err) {
                res.status(500).json({ message: 'Erreur lors de la récupération de vos amis !' })
            } else {
                if (results === undefined || results.length === 0) {
                    res.status(200).json({ results })
                } else {
                    res.status(200).json({ results })
                }
            }
        }
    )
};

// Cette fonction va nous permettre d'envoyer une demande d'amitié
exports.sendRequest = (req, res, next) => {
    let sql = `SELECT * FROM requests_friendship WHERE user_id_sender = ? AND user_id_recipient = ? OR user_id_sender = ? AND user_id_recipient = ?;`;
    connection.query(
        sql, [req.user.userId, req.params.id, req.params.id, req.user.userId], function (err, results) {
            if (err) {
                res.status(500).json({ message: 'Erreur lors de la vérification de la demande d\'amitié !' })
            } else {
                if (results === undefined || results.length === 0) {
                    let sql = `INSERT INTO requests_friendship (user_id_sender, user_id_recipient, request_date) VALUES (?, ?, NOW());`;
                    connection.query(
                        sql, [req.user.userId, req.params.id], function (err, results) {
                            if (err) {
                                console.log(err);
                                res.status(500).json({ message: 'Erreur lors de l\'envoi de la demande d\'amitié !' })
                            } else {
                                sql = `SELECT requests_friendship.id as requestId, requests_friendship.user_id_sender, requests_friendship.user_id_recipient, requests_friendship.request_date, requests_friendship.approve_date, requests_friendship.denied_date, users.id, users.firstname, users.lastname, users.picture_url, users.email, users.account_disabled, users.role_id, users.session_id, users.userID FROM requests_friendship LEFT JOIN users ON users.id = requests_friendship.user_id_recipient WHERE requests_friendship.user_id_sender = ? AND requests_friendship.user_id_recipient = ?;`;
                                connection.query(
                                    sql, [req.user.userId, req.params.id], function (err, results) {
                                        if (err) {
                                            console.log(err);
                                            res.status(500).json({ message: 'Erreur lors de la récupération de la demande d\'amitié !' })
                                        } else {
                                            res.status(200).json({ message: 'Votre demande d\'amitié a été prise en compte !', results })
                                        }
                                    }
                                )
                            }
                        }
                    )
                } else {
                    res.status(200).json({ message: 'Vous avez déjà une demande d\'amitié en cours avec cet utilisateur !' })
                }
            }
        }
    )
};

// Cette fonction va nous permettre de répondre à une demande d'amitié en l'acceptant ou en la refusant
exports.replyToRequest = (req, res, next) => {
    let sql = "";
    if (req.body.response == "accepted") {
        sql = `UPDATE requests_friendship SET approve_date = NOW() WHERE id = ?`;
    } else if (req.body.response == "refused") {
        sql = `DELETE FROM requests_friendship WHERE id = ?`;
    }
    connection.query(
        sql, [req.params.id], function (err, results) {
            if (err) {
                console.log(err);
                res.status(500).json({ message: 'Erreur lors de la vérification de la demande d\'amitié !' })
            } else {
                res.status(200).json({ message: 'Votre réponse a bien été prise en compte !' })
            }
        }
    )
};

// Cette fonction va nous permettre de rechercher des utilisateurs
exports.searchUser = (req, res, next) => {
    let sql = `SELECT users.id as user_id, users.picture_url, users.lastname, users.firstname, users.gender_id, users.birthday, users.email, users.role_id, users.created_at, users.account_disabled, users.session_id, users.userID FROM users WHERE lastname LIKE ? OR firstname LIKE ? GROUP BY user_id;`;
    let search = '%' + req.query.search + '%';
    connection.query(
        sql, [search, search], function (err, results) {
            if (err) {
                res.status(500).json({ message: 'Erreur lors de la recherche d\'utilisateur !' })
            } else {
                if (results === undefined || results.length === 0) {
                    res.status(200).json({ message: 'Aucun résultat ! ' })
                } else {
                    if (results.length === 1) {
                        res.status(200).json({ message: '1 résultat correspond à votre recherche !', results })
                    } else {
                        res.status(200).json({ message: `${results.length} résultats correspondent à votre recherche !`, results })
                    }
                }
            }
        }
    )
};

// Cette fonction va nous permettre de supprimer un ami
exports.deleteFriend = (req, res, next) => {
    let sql = `DELETE FROM requests_friendship WHERE user_id_sender = ? AND user_id_recipient = ? AND approve_date IS NOT NULL OR user_id_sender = ? AND user_id_recipient = ? AND approve_date IS NOT NULL;`;
    connection.query(
        sql, [req.user.userId, req.params.id, req.params.id, req.user.userId], function (err, results) {
            if (err) {
                console.log(err);
                res.status(500).json({ message: 'Erreur lors de la suppression de l\'amitié !' })
            } else {
                sql = `DELETE FROM messages WHERE sender = ? AND recipient = ? OR sender = ? AND recipient = ?`;
                connection.query(
                    sql, [req.user.userId, req.params.id, req.params.id, req.user.userId], function (err, results) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({ message: 'Erreur lors de la suppression de l\'amitié !' })
                        } else {
                            res.status(200).json({ message: 'Les messages ont bien été supprimé !' })
                        }
                    }
                )
            }
        }
    )
};

// Cette fonction va nous permettre d'annuler une demande d'amitié émise en cours
exports.cancelRequest = (req, res, next) => {
    let sql = `DELETE FROM requests_friendship WHERE user_id_sender = ? AND user_id_recipient = ? AND approve_date IS NULL AND denied_date IS NULL;`;
    connection.query(
        sql, [req.user.userId, req.params.id], function (err, results) {
            if (err) {
                console.log(err);
                res.status(500).json({ message: 'Erreur lors de l\'annulation de la demande d\'amitié !' })
            } else {
                res.status(200).json({ message: 'Votre demande d\'amitié a été annulée !' })
            }
        }
    )
};

// Cette fonction va nous permettre de récupérer les demandes d'amitié que nous avons envoyé en attente de réponse 
exports.checkRequestsSended = (req, res, next) => {
    let sql = `SELECT request_date, users.id, users.picture_url, users.lastname, users.firstname, users.email, users.role_id, users.account_disabled, users.session_id, users.userID FROM requests_friendship LEFT JOIN users ON users.id = user_id_recipient WHERE user_id_sender = ? AND approve_date IS NULL AND denied_date IS NULL;`;
    connection.query(
        sql, [req.user.userId], function (err, results) {
            if (err) {
                console.log(err);
                res.status(500).json({ message: 'Erreur lors de la vérification des demandes d\'amitié envoyées !' })
            } else {
                if (results === undefined || results.length === 0) {
                    res.status(200).json({ message: 'Vous n\'avez aucune demande d\'amitié en cours!', results })
                } else {
                    res.status(200).json({ message: 'Vous avez des demandes d\'amitié en cours !', results })
                }
            }
        }
    )
};