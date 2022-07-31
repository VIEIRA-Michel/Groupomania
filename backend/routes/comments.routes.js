const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments');
// const checkInput = require('../middlewares/checkInput');
const sanitize = require('../middlewares/sanitizer');

router.get('/:id/comments', commentsController.getAllCommentsFromPublication);
router.post('/:id/comments', sanitize, commentsController.createComment);
router.delete('/:id/comments/:id', commentsController.deleteComment);

module.exports = router