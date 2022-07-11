const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments');
// const checkInput = require('../middlewares/checkInput');
const sanitize = require('../middlewares/sanitizer');

router.post('/comments', sanitize, commentsController.createComment);
router.delete('/comments/:id', commentsController.deleteComment);

module.exports = router