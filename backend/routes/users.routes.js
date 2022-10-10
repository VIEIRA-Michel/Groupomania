const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');
const multer = require('../middlewares/multer-config');

// La route permettant de mettre à jour son profil
router.put('/profil', multer, userController.updateProfil);
// La route permettant de vérifier si le token est toujours valide et par la même occasion de récupérer les informations de l'utilisateur
router.get('/me', userController.me);
// La route permettant de récupérer tous les amis d'un utilisateur
router.get('/:id/friends', userController.getAllFriendsOfUser);
// La route permettant de récupérér toutes les notifications
router.get('/notifications', userController.getAllNotifications);

module.exports = router;