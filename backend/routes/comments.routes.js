const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments');
const checkInput = require('../middlewares/checkInput');

router.post('/comments', checkInput, commentsController.createComment);
router.delete('/comments/:id', commentsController.deleteComment);

module.exports = router