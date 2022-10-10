const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments');
const sanitize = require('../middlewares/sanitizer');

// La route permettant de récupérer un certains nombre de commentaires
router.get('/:id/comments', commentsController.getAllCommentsFromPublication);
// La route permettant de récupérer le nombre total de commentaires disponibles sur une publication
router.get('/:id/comments/count', sanitize, commentsController.getNumberOfComments);
// La route permettant de créer un commentaire
router.post('/:id/comments', sanitize, commentsController.createComment);
// La route permettant de supprimer un commentaire
router.delete('/:id/comments/:id', commentsController.deleteComment);

module.exports = router;