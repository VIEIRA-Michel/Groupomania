const connection = require('../database/mysql_connexion');
const bcrypt = require('bcrypt');

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