const express = require('express');
const router = express.Router();
const userController = require('../controllers/users')
const publicationsController = require('../controllers/publications');

router.put('/profil', userController.updateProfil);
router.put('/password', userController.changePassword);
router.put('/disabled', userController.disabledProfil);
router.get('/:id/publications', publicationsController.getPublicationsOfOnePerson);

module.exports = router;