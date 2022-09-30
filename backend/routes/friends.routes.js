const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friends');

router.get('/', friendsController.getAllFriends);
router.get('/search', friendsController.searchUser);
router.get('/requests', friendsController.getRequests);
router.put('/requests/:id', friendsController.replyToRequest);
router.get('/requests/sended', friendsController.checkRequestsSended);
router.post('/search/:id', friendsController.sendRequest);
router.delete('/requests/:id', friendsController.cancelRequest);
router.delete('/:id', friendsController.deleteFriend);

module.exports = router;