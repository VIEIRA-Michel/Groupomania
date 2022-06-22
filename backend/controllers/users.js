// const mysql = require('../database/mysql_connexion');
const bcrypt = require('bcrypt');
const connection = require('../database/mysql_connexion');
// const date = require('date-and-time');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            // const now = new Date();
            // let today = date.format(now, 'DD-MM-YYYY');
            let user = {
                email: req.body.email,
                password: hash,
            };
            console.log(user);
            let sql = `INSERT INTO users (email, password) VALUES (?, ?);`;
            connection.query(
                sql, [user.email, user.password], function (err, results) {
                    if (err) throw err;
                    console.log(results); // results contains rows returned by server
                }
            )
            res.status(201).json({ message: 'Utilisateur enregistré ! ' })

        })
        .catch(error => res.status(500).json({ message: error }))
};

exports.login = (req, res, next) => {
    let user = {
        email: req.body.email
    };
    let sql = `SELECT email, password FROM users WHERE email = ?;`;
    connection.query(
        sql, [user.email], function (err, results) {
            if(err) throw err;
            bcrypt.compare(req.body.password, results[0].password)
            .then(valid => {
                if(!valid) {
                    return res.status(401).json({ error: 'Mot de passe incorrect !' });
                }
                res.status(200).json({
                    message : "Utilisateur connecté !"
                })
            })
            .catch(error => res.status(500).json({ message: error }))
        }
    )
}