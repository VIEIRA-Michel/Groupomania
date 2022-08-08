const express = require('express');
const router = express.Router();
const userController = require('../controllers/users')
const publicationsController = require('../controllers/publications');
const multer = require('../middlewares/multer-config');

router.put('/profil', multer, userController.updateProfil);
router.put('/password', userController.changePassword);
router.put('/disabled', userController.disabledProfil);
router.get('/:id/publications', publicationsController.getPublicationsOfOnePerson);
router.get('/me', userController.me);

module.exports = router;