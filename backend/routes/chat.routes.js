const express = require('express');
const router = express.Router();
const multer = require('../middlewares/multer-config');
const chatController = require('../controllers/chat');

// La route permettant d'envoyer un message
router.post('/:id/messages', multer, chatController.sendMessage);
// La route permettant de récupérer un certains nombre de messages d'une conversation
router.get('/:id/messages', chatController.getMessageOfConversation);
// La route permettant de récupérer le nombre total de messages d'une conversation
router.get('/:id/messages/count', chatController.countMessages);
// La route permettant de récupérer les utilisateurs connectés
router.get('/connected', chatController.getUsersConnected);

module.exports = router;