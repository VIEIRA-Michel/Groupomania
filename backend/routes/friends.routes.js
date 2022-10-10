const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friends');

// La route permettant de récupérer tous nos amis
router.get('/', friendsController.getAllFriends);
// La route permettant de rechercher un utilisateur
router.get('/search', friendsController.searchUser);
// La route permettant de récupérer les demandes d'amis reçues
router.get('/requests', friendsController.getRequests);
// La route permettant de répondre à une demande d'amis
router.put('/requests/:id', friendsController.replyToRequest);
// La route permettant de récupérer les demandes d'amis envoyées
router.get('/requests/sended', friendsController.checkRequestsSended);
// La route permettant d'envoyer une demande d'amis
router.post('/search/:id', friendsController.sendRequest);
// La route permettant d'annuler une demande d'amis envoyée
router.delete('/requests/:id', friendsController.cancelRequest);
// La route permettant de supprimer un ami
router.delete('/:id', friendsController.deleteFriend);

module.exports = router;