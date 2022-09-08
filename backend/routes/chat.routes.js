const express = require('express');
const router = express.Router();
const multer = require('../middlewares/multer-config');
const chatController = require('../controllers/chat');

// router.put('/profil', multer, userController.updateProfil);
router.post('/:id/messages', multer, chatController.sendMessage);
router.get('/:id/messages', chatController.getMessageOfConversation);
router.get('/inbox', chatController.getAllMessages);
router.get('/connected', chatController.getUsersConnected);

module.exports = router;