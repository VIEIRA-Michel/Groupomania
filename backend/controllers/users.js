const bcrypt = require('bcrypt');
const connection = require('../database/mysql_connexion');
const redis = require('../database/redis_connexion');
const jwt = require('jsonwebtoken');
const fs = require('fs');
require('dotenv').config();
const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            let user = {
                picture_url: `https://media.istockphoto.com/vectors/default-profile-picture-avatar-photo-placeholder-vector-illustration-vector-id1223671392?k=20&m=1223671392&s=170667a&w=0&h=kEAA35Eaz8k8A3qAGkuY8OZxpfvn9653gDjQwDHZGPE=`,
                lastname: req.body.lastname,
                firstname: req.body.firstname,
                email: req.body.email,
                password: hash,
                session: randomId(),
                userID: randomId()
            };
            let sql = `INSERT INTO users (picture_url, lastname, firstname, email, password, created_at, session_id, userID) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?);`;
            connection.query(
                sql, [user.picture_url, user.lastname, user.firstname, user.email, user.password, user.session, user.userID], function (err, results) {
                    if (err) {
                        res.status(500).json({ message: 'Adresse email déjà utilisée' });
                    }
                    if (!err) {
                        (async () => {
                            await redis.set(
                                `user:${results.insertId}`,
                                JSON.stringify({
                                    username: user.firstname + ' ' + user.lastname,
                                    conversations: [],
                                    session_id: user.session,
                                    userID: user.userID,
                                    user: results.insertId,
                                    picture: user.picture_url
                                })
                            );
                            const userConnected = await redis.get(`connected`);
                            if (!userConnected) {
                                await redis.set(`connected`,
                                    JSON.stringify({
                                        userID: user.userID,
                                        user: results.insertId,
                                        username: user.firstname + ' ' + user.lastname,
                                        picture: user.picture_url,
                                        connected: false,
                                    })
                                );
                            } else {
                                await redis.append(`connected`, ',');
                                await redis.append(`connected`, JSON.stringify({
                                    userID: user.userID,
                                    user: results.insertId,
                                    username: user.firstname + ' ' + user.lastname,
                                    picture: user.picture_url,
                                    connected: false,
                                }));
                            }

                            const getStringResult = await redis.get(`user:${results.insertId}`);
                            res.status(201).json({ message: 'Utilisateur enregistré ! ' })
                        })();
                    }
                }
            )


        })
        .catch(error => res.status(500).json({ message: error }));
};

exports.login = (req, res, next) => {
    let user = {
        email: req.body.email
    };
    let sql = `SELECT id, picture_url, firstname, lastname, email, password, session_id, userID, role_id FROM users WHERE email = ?;`;
    connection.query(
        sql, [user.email], function (err, results) {
            if (err) {
                console.log(err);
            } else {
                if (results.length !== 0) {
                    bcrypt.compare(req.body.password, results[0].password)
                        .then(valid => {
                            if (!valid) {
                                return res.status(401).json({ error: 'Mot de passe incorrect !' });
                            }
                            (async () => {
                                const getStringResult = await redis.get(`user:${results[0].id}`);
                                res.status(200).json({
                                    accessToken: jwt.sign(
                                        {
                                            userId: results[0].id,
                                            picture_url: results[0].picture_url,
                                            firstname: results[0].firstname,
                                            lastname: results[0].lastname,
                                            role_id: results[0].role_id,
                                            email: results[0].email
                                        },
                                        process.env.ACCESS_TOKEN_SECRET,
                                        { expiresIn: '7d' }),
                                    user: {
                                        user_id: results[0].id,
                                        picture_url: results[0].picture_url,
                                        firstname: results[0].firstname,
                                        lastname: results[0].lastname,
                                        email: results[0].email,
                                        session_id: results[0].session_id,
                                        userID: results[0].userID,
                                        role_id: results[0].role_id
                                    },
                                    redis: JSON.parse(getStringResult)
                                })
                            })();
                        }).catch(error => res.status(500).json({ message: error }))
                } else {
                    res.status(401).json({ message: `L'adresse email n'existe pas !` });
                }

            }
        }
    )
}

exports.updateProfil = (req, res, next) => {
    let sql = `SELECT * FROM users WHERE id = ?;`;
    connection.query(
        sql, [req.user.userId], function (err, results) {
            if (err) {
                console.log(err);
                res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
            } else {
                if (results.length === 0) {
                    res.status(404).json({ message: 'Utilisateur introuvable' });
                } else {
                    let profile = req.file ?
                        {
                            ...req.body,
                            picture: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
                        } : {
                            ...req.body,
                        };

                    let arrSql = [];
                    let arrSqlValue = [];
                    if (profile.email) {
                        arrSql.push('email = ?');
                        arrSqlValue.push(profile.email);
                    }
                    if (req.file) {
                        if (results[0].picture_url !== null) {
                            const filename = results[0].picture_url.split('/images/')[1];
                            fs.unlink(`images/${filename}`, () => {
                                console.log('Image supprimée');
                            });
                        }
                        arrSql.push('picture_url = ?');
                        arrSqlValue.push(profile.picture);

                    }

                    if (profile.password) {
                        bcrypt.hash(profile.password, 10)
                            .then(hash => {
                                arrSql.push('password = ?');
                                arrSqlValue.push(hash);
                            }).catch(error => res.status(500).json({ message: error }));
                    }

                    let reqSql = `UPDATE users SET ` + arrSql.join(', ') + ` WHERE id = ?;`;
                    arrSqlValue.push(req.user.userId);
                    connection.query(
                        reqSql, arrSqlValue, function (err, results) {
                            if (err) {
                                console.log(err);
                                res.status(500).json({ message: 'Erreur lors de la modification du profil' });
                            } else {
                                sql = `SELECT id, picture_url, firstname, lastname, email, session_id, userID FROM users WHERE id = ?;`;
                                connection.query(
                                    sql, [req.user.userId], function (err, results) {
                                        if (err) {
                                            console.log(err);
                                            res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
                                        } else {
                                            if (results.length === 0) {
                                                res.status(404).json({ message: 'Utilisateur introuvable' });
                                            } else {
                                                res.status(200).json(results);
                                            }
                                        }
                                    }
                                )
                            }
                        }
                    )
                }
            }
        }
    )
}

exports.disabledProfil = (req, res, next) => {
    let sql = `UPDATE users SET account_disabled = ? WHERE id = ?;`;
    connection.query(
        sql, [req.body.disabled, req.user.userId], function (err, results) {
            if (err) {
                console.log(err)
                res.status(500).json({ message: 'Erreur lors de la désactivation du profil' });
            } else {
                if (req.body.disabled === true) {
                    console.log('le resultat', results);
                    res.status(200).json({ message: 'Profil désactiver ! ' })
                }
            }

        }
    )
}

exports.me = (req, res, next) => {
    let sql = `SELECT id, picture_url, lastname, firstname, email, birthday, session_id, userID, role_id FROM users WHERE id = ?;`;
    connection.query(
        sql, [req.user.userId], function (err, results) {
            if (err) {
                console.log(err)
                res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
            } else {
                if (results.length === 0) {
                    res.status(404).json({ message: 'Utilisateur introuvable' });
                } else {
                    res.status(200).json({
                        user_id: results[0].id,
                        picture_url: results[0].picture_url,
                        lastname: results[0].lastname,
                        firstname: results[0].firstname,
                        email: results[0].email,
                        session_id: results[0].session_id,
                        userID: results[0].userID,
                        role_id: results[0].role_id
                    });
                }
            };
        })
};

exports.getAllFriendsOfUser = (req, res, next) => {
    let sql = `SELECT sender.id as sender_user_id, sender.picture_url as sender_picture_url, sender.lastname as sender_lastname, sender.firstname as sender_firstname, sender.gender_id as sender_gender_id, sender.birthday as sender_birthday, sender.email as sender_email, sender.role_id as sender_role_id, sender.created_at as sender_created_at, sender.account_disabled as sender_account_disabled, recipient.id as recipient_user_id, recipient.picture_url as recipient_picture_url, recipient.lastname as recipient_lastname, recipient.firstname as recipient_firstname, recipient.gender_id as recipient_gender_id, recipient.birthday as recipient_birthday, recipient.email as recipient_email, recipient.role_id as recipient_role_id, recipient.created_at as recipient_created_at, recipient.account_disabled as recipient_account_disabled, requests_friendship.id as requestId, requests_friendship.request_date, requests_friendship.approve_date, requests_friendship.denied_date FROM requests_friendship LEFT JOIN users sender ON sender.id = requests_friendship.user_id_sender AND sender.account_disabled IS NULL LEFT JOIN users recipient ON recipient.id = requests_friendship.user_id_recipient AND recipient.account_disabled IS NULL WHERE (requests_friendship.user_id_recipient = ? AND requests_friendship.approve_date IS NOT NULL AND requests_friendship.denied_date IS NULL) OR (requests_friendship.user_id_sender = ? AND requests_friendship.approve_date IS NOT NULL AND requests_friendship.denied_date IS NULL) GROUP BY requestId;`;
    connection.query(
        sql, [req.params.id, req.params.id], function (err, results) {
            if (err) throw err;
            if (results === undefined || results.length === 0) {
                res.status(200).json({ results });
            }
            else {
                res.status(200).json({ results });
            }
        }
    )
}