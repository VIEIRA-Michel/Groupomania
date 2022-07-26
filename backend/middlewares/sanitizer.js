const sanitizer = require('sanitizer');

module.exports = (req, res, next) => {

    // Pour chaque champ de notre body (qui contient les données à sauvegarder), on va sanitizer chacun des champs
    for (const key in req.body) {
        //Si le champ du body est un tableau
        if (Array.isArray(req.body[key])) {
            //Alors pour chaque champ du tableau
            for (const item of req.body[key]) {
                //Si c'est un object, on sanitize chaque propriété
                if (typeof (item === 'object')) {
                    for (const key in item) {
                        item[key] = sanitizer.escape(item[key])
                    }
                }
                //Sinon, si ce n'est ni un object, ni un boolean ni un number, on sanitize la valeur directement
                else if (typeof (req.body[key]) !== 'boolean' && typeof (req.body[key]) !== 'number') {
                    item = sanitizer.escape(item);
                }
            }
        } else if (typeof (req.body[key]) !== 'boolean' && typeof (req.body[key]) !== 'number') {
            req.body[key] = sanitizer.escape(req.body[key]);
        }
    }

    // On continue d'envoyer notre requête avec les données sécurisées
    next();
}