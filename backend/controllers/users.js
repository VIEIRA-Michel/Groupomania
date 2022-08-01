// const mysql = require('../database/mysql_connexion');
const bcrypt = require('bcrypt');
const connection = require('../database/mysql_connexion');
const jwt = require('jsonwebtoken');
const date = require('date-and-time');
require('dotenv').config();

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const now = new Date();
            let today = date.format(now, 'YYYY-MM-DD');
            let user = {
                lastname: req.body.lastname,
                firstname: req.body.firstname,
                email: req.body.email,
                password: hash,
                created_at: today
            };
            let sql = `INSERT INTO users (lastname, firstname, email, password, created_at) VALUES (?, ?, ?, ?, ?);`;
            connection.query(
                sql, [user.lastname, user.firstname, user.email, user.password, user.created_at], function (err, results) {
                    if (err) {
                        res.status(500).json({ message: 'Adresse email déjà utilisée' });
                    }
                    if (!err) {
                        res.status(201).json({ message: 'Utilisateur enregistré ! ' })
                    }
                }
            )


        })
        .catch(error => res.status(500).json({ message: error }))
};

exports.login = (req, res, next) => {
    let user = {
        email: req.body.email
    };
    let sql = `SELECT id, email, password FROM users WHERE email = ?;`;
    connection.query(
        sql, [user.email], function (err, results) {
            if (err) throw err;
            bcrypt.compare(req.body.password, results[0].password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        accessToken: jwt.sign(
                            {
                                userId: results[0].id,
                                firstname: results[0].firstname,
                                lastname: results[0].lastname,
                                role_id: results[0].role_id,
                                email: results[0].email
                            },
                            process.env.ACCESS_TOKEN_SECRET,
                            { expiresIn: '120m' }
                        ),
                        refreshToken: jwt.sign(
                            {
                                userId: results[0].id,
                                firstname: results[0].firstname,
                                lastname: results[0].lastname,
                                role_id: results[0].role_id,
                                email: results[0].email
                            },
                            process.env.REFRESH_TOKEN_SECRET,
                            { expiresIn: '120m' })
                    })
                })
                .catch(error => res.status(500).json({ message: error }))
        }
    )
}

exports.updateProfil = (req, res, next) => {
    console.log(req.user.userId);
    const profilObject = { ...req.body }
    console.log('profilObject', profilObject);
    let sql = `UPDATE users SET lastname = ?, firstname = ?, gender_id = ?, birthday = ? WHERE id = ?;`;
    connection.query(
        sql, [profilObject.lastname, profilObject.firstname, profilObject.gender_id, profilObject.birthday, req.user.userId], function (err, results) {
            if (err) {
                console.log(err)
                res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
            }
            if (!err) {
                console.log('le resultat', results);
                res.status(200).json({ message: 'Profil mis à jour ! ' })
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

exports.changePassword = (req, res, next) => {
    let sql = `SELECT password FROM users WHERE id = ?;`;
    connection.query(
        sql, [req.user.userId], function (err, results) {
            if (err) throw err;
            bcrypt.compare(req.body.OldPassword, results[0].password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    if (req.body.newPassword === req.body.confirmPassword) {
                    bcrypt.hash(req.body.newPassword, 10)
                        .then(hash => {
                            let sql = `UPDATE users SET password = ? WHERE id = ?;`;
                            connection.query(
                                sql, [hash, req.user.userId], function (err, results) {
                                    if (err) {
                                        console.log(err)
                                        res.status(500).json({ message: 'Erreur lors du changement du mot de passe' });
                                    }
                                    if (!err) {
                                        console.log('le resultat', results);
                                        res.status(200).json({ message: 'Mot de passe changé ! ' })
                                    }
                                }
                            )
                        })
                        .catch(error => res.status(500).json({ message: error }));
                } else {
                    return res.status(401).json({ error: 'Les mots de passe ne correspondent pas !' });
                }})
                .catch(error => res.status(500).json({ message: error }))
        }
    )
}

exports.me = (req, res, next) => {
    let sql = `SELECT id, lastname, firstname, email, birthday FROM users WHERE id = ?;`;
    connection.query(
        sql, [req.user.userId], function (err, results) {
            if (err) throw err;
            res.status(200).json({
                user_id: results[0].id,
                lastname: results[0].lastname,
                firstname: results[0].firstname,
                email: results[0].email,
                birthday: results[0].birthday
            })
        }   )
}
