const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');
const multer = require('../middlewares/multer-config');

router.put('/profil', multer, userController.updateProfil);
router.get('/me', userController.me);
router.get('/:id/friends', userController.getAllFriendsOfUser);
router.get('/notifications', userController.getAllNotifications);

module.exports = router;