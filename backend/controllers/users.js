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
                email: req.body.email,
                password: hash,
                created_at: today
            };
            let sql = `INSERT INTO users (email, password) VALUES (?, ?);`;
            connection.query(
                sql, [user.email, user.password], function (err, results) {
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
                            { expiresIn: '1800s' }
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
                            { expiresIn: '7d' })
                    })
                })
                .catch(error => res.status(500).json({ message: error }))
        }
    )
}