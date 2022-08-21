const bcrypt = require('bcrypt');
const connection = require('../database/mysql_connexion');
const redis = require('../database/redis_connexion');
const jwt = require('jsonwebtoken');
const fs = require('fs');
require('dotenv').config();

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            let user = {
                picture_url: `https://media.istockphoto.com/vectors/default-profile-picture-avatar-photo-placeholder-vector-illustration-vector-id1223671392?k=20&m=1223671392&s=170667a&w=0&h=kEAA35Eaz8k8A3qAGkuY8OZxpfvn9653gDjQwDHZGPE=`,
                lastname: req.body.lastname,
                firstname: req.body.firstname,
                email: req.body.email,
                password: hash,
            };
            let sql = `INSERT INTO users (picture_url, lastname, firstname, email, password, created_at) VALUES (?, ?, ?, ?, ?, NOW());`;
            connection.query(
                sql, [user.picture_url, user.lastname, user.firstname, user.email, user.password], function (err, results) {
                    if (err) {
                        res.status(500).json({ message: 'Adresse email déjà utilisée' });
                    }
                    if (!err) {
                        (async () => {
                            await redis.set(
                                `user:${results.insertId}`,
                                JSON.stringify({
                                    firstname: req.body.firstname,
                                    lastname: req.body.lastname,
                                    conversations: []
                                })
                            );

                            const getStringResult = await redis.get(`user:${results.insertId}`);
                            console.log("Get string result: ", JSON.parse(getStringResult));
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
    let sql = `SELECT id, picture_url, firstname, lastname, email, password, session_id FROM users WHERE email = ?;`;
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
                                        { expiresIn: '120m' }),
                                    refreshToken: jwt.sign(
                                        {
                                            userId: results[0].id,
                                            picture_url: results[0].picture_url,
                                            firstname: results[0].firstname,
                                            lastname: results[0].lastname,
                                            role_id: results[0].role_id,
                                            email: results[0].email
                                        },
                                        process.env.REFRESH_TOKEN_SECRET,
                                        { expiresIn: '120m' }),
                                    user: {
                                        user_id: results[0].id,
                                        picture_url: results[0].picture_url,
                                        firstname: results[0].firstname,
                                        lastname: results[0].lastname,
                                        email: results[0].email,
                                        session_id: results[0].session_id
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
                    if (profile.email && req.file && profile.password) {
                        if (results[0].picture_url !== null) {
                            const filename = results[0].picture_url.split('/images/')[1];
                            fs.unlink(`images/${filename}`, () => {
                                console.log('Image supprimée');
                            });
                        }
                        bcrypt.hash(profile.password, 10)
                            .then(hash => {
                                sql = 'UPDATE users SET picture_url = ?, email = ?, password = ? WHERE id = ?;';
                                connection.query(
                                    sql, [profile.picture, profile.email, hash, req.user.userId], function (err, results) {
                                        if (err) {
                                            console.log(err)
                                            res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
                                        }
                                        if (!err) {
                                            res.status(200).json({ message: 'Profil mis à jour ! ' })
                                        }
                                    }
                                )
                            })
                            .catch(error => res.status(500).json({ message: error }));

                    } else if (req.file && !profile.email && !profile.password) {
                        if (results[0].picture_url !== null) {
                            const filename = results[0].picture_url.split('/images/')[1];
                            fs.unlink(`images/${filename}`, () => {
                                console.log('Image supprimée');
                            });
                        }
                        sql = 'UPDATE users SET picture_url = ? WHERE id = ?;';
                        connection.query(
                            sql, [profile.picture, req.user.userId], function (err, results) {
                                if (err) {
                                    console.log(err)
                                    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
                                }
                                if (!err) {
                                    res.status(200).json({ message: 'Profil mis à jour ! ' })
                                }
                            }
                        )
                    } else if (profile.email && !req.file && !profile.password) {
                        sql = 'UPDATE users SET email = ? WHERE id = ?;';
                        connection.query(
                            sql, [profile.email, req.user.userId], function (err, results) {
                                if (err) {
                                    console.log(err)
                                    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
                                }
                                if (!err) {
                                    res.status(200).json({ message: 'Profil mis à jour ! ' })
                                }
                            }
                        )
                    } else if (profile.password && !req.file && !profile.email) {
                        bcrypt.hash(profile.password, 10)
                            .then(hash => {
                                sql = 'UPDATE users SET password = ? WHERE id = ?;';
                                connection.query(
                                    sql, [hash, req.user.userId], function (err, results) {
                                        if (err) {
                                            console.log(err)
                                            res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
                                        }
                                        if (!err) {
                                            res.status(200).json({ message: 'Profil mis à jour ! ' })
                                        }
                                    }
                                )
                            })
                            .catch(error => res.status(500).json({ message: error }));

                    } else if (req.file && profile.email && !profile.password) {
                        if (results[0].picture_url !== null) {
                            const filename = results[0].picture_url.split('/images/')[1];
                            fs.unlink(`images/${filename}`, () => {
                                console.log('Image supprimée');
                            });
                        }
                        sql = 'UPDATE users SET picture_url = ?, email = ? WHERE id = ?;';
                        connection.query(
                            sql, [profile.picture, profile.email, req.user.userId], function (err, results) {
                                if (err) {
                                    console.log(err)
                                    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
                                }
                                if (!err) {
                                    res.status(200).json({ message: 'Profil mis à jour ! ' })
                                }
                            }
                        )
                    } else if (profile.email && profile.password && !req.file) {
                        bcrypt.hash(profile.password, 10)
                            .then(hash => {
                                sql = 'UPDATE users SET email = ?, password = ? WHERE id = ?;';
                                connection.query(
                                    sql, [profile.email, hash, req.user.userId], function (err, results) {
                                        if (err) {
                                            console.log(err)
                                            res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
                                        }
                                        if (!err) {
                                            res.status(200).json({ message: 'Profil mis à jour ! ' })
                                        }
                                    }
                                )
                            })
                            .catch(error => res.status(500).json({ message: error }));

                    } else if (profile.password && req.file && !profile.email) {
                        if (results[0].picture_url !== null) {
                            const filename = results[0].picture_url.split('/images/')[1];
                            fs.unlink(`images/${filename}`, () => {
                                console.log('Image supprimée');
                            });
                        }
                        bcrypt.hash(profile.password, 10)
                            .then(hash => {
                                sql = 'UPDATE users SET password = ?, picture_url = ? WHERE id = ?;';
                                connection.query(
                                    sql, [hash, profile.picture, req.user.userId], function (err, results) {
                                        if (err) {
                                            console.log(err)
                                            res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
                                        }
                                        if (!err) {
                                            res.status(200).json({ message: 'Profil mis à jour ! ' })
                                        }
                                    }
                                )
                            })
                            .catch(error => res.status(500).json({ message: error }));
                    }
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
            }
            if (!err) {
                if (req.body.disabled === true) {
                    console.log('le resultat', results);
                    res.status(200).json({ message: 'Profil désactiver ! ' })
                }
            }

        }
    )
}


exports.me = (req, res, next) => {
    let sql = `SELECT id, picture_url, lastname, firstname, email, birthday FROM users WHERE id = ?;`;
    connection.query(
        sql, [req.user.userId], function (err, results) {
            if (err) throw err;
            res.status(200).json({
                user_id: results[0].id,
                picture_url: results[0].picture_url,
                lastname: results[0].lastname,
                firstname: results[0].firstname,
                email: results[0].email,
            })
        })
}

exports.checkSession = (req, res, next) => {
    let sql = `SELECT session_id FROM users WHERE id = ?;`;
    connection.query(
        sql, [req.user.userId], function (err, results) {
            if (err) {
                console.log(err)
                res.status(500).json({ message: 'Erreur lors de la récupération de la session' });
            }
            res.status(200).json({ data: results[0] })
        }
    )
}

exports.initializeSession = (req, res, next) => {
    let sql = `UPDATE users SET session_id = ? WHERE id = ?;`;
    connection.query(
        sql, [req.body.session_id, req.user.userId], function (err, results) {
            if (err) {
                console.log(err)
                res.status(500).json({ message: 'Erreur lors de la récupération de la session' });
            }
            sql = `SELECT id, session_id FROM users WHERE id = ?;`;
            connection.query(
                sql, [req.user.userId], function (err, results) {
                    if (err) {
                        console.log(err)
                        res.status(500).json({ message: 'Erreur lors de la récupération de la session' });
                    }
                    res.status(200).json({ data: results[0] })
                }
            )
        }
    )
}