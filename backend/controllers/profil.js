const connection = require('../database/mysql_connexion');

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