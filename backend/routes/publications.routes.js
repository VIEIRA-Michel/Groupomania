const express = require('express');
const router = express.Router();
const publicationsController = require('../controllers/publications')


router.post('/publications', publicationsController.createPublication);
router.put('/publications/:id', publicationsController.updatePublication);
router.delete('/publications/:id', publicationsController.deletePublication);
router.post('/publications/:id', publicationsController.likePublication);
router.post('/publications/:id/comments', publicationsController.createComment);
router.delete('/publications/:id/comments/:id', publicationsController.deleteComment);
// router.get('/publications', publicationsController.getAllPublications);
router.get('/:id/publications', publicationsController.getPublicationsOfOnePerson);

module.exports = router;