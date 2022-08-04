const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friends')

router.get('/', friendsController.getAllFriends);
router.get('/requests', friendsController.getRequests);
router.put('/requests/:id', friendsController.replyToRequest);
router.get('/search', friendsController.search);
router.post('/search/:id', friendsController.sendRequest);
router.delete('/:id', friendsController.deleteFriend);

module.exports = router;