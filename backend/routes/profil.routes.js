const express = require('express');
const router = express.Router();
const profilController = require('../controllers/profil')


router.put('/', profilController.updateProfil);
router.put('/password', profilController.changePassword);
router.put('/disabled', profilController.disabledProfil);

module.exports = router;