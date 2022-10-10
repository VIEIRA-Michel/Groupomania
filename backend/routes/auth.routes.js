const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');
const emailValidator = require('../middlewares/email-validator');
const passwordValidator = require('../middlewares/password-validator');

// La route permettant de s'inscrire
router.post('/signup', emailValidator, passwordValidator, userController.signup);
// La route permettant de se connecter
router.post('/login', userController.login);

module.exports = router;