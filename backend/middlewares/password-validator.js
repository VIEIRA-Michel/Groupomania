const passwordSchema = require('../models/password');

module.exports = (req, res, next) => {
    if (passwordSchema.validate(req.body.password)) {
        next()
    } else {
        console.log(passwordSchema.validate(req.body.password, { list: true }));
        res.status(400).json(passwordSchema.validate(req.body.password, { list: true }))
    }
};