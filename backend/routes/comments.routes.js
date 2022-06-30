const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments')

router.post('/comments', commentsController.createComment);
router.delete('/comments/:id', commentsController.deleteComment);

module.exports = router