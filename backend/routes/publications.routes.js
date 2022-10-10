const express = require('express');
const router = express.Router();
const publicationsController = require('../controllers/publications');
const multer = require('../middlewares/multer-config');
const sanitize = require('../middlewares/sanitizer');

// La route permettant de créer une publication
router.post('/', multer, sanitize, publicationsController.createPublication);
// La route permettant de modifier une publication
router.put('/:id', multer, sanitize, publicationsController.updatePublication);
// La route permettant de supprimer une publication
router.delete('/:id', publicationsController.deletePublication);
// La route permettant de récupérer toutes les publications
router.get('/', publicationsController.getAllPublications);
// La route permettant de liker ou de disliker une publication
router.post('/:id/likes', publicationsController.likePublication);
// La route permettant de récupérer le nombre total de publications disponibles sur l'accueil
router.get('/count', publicationsController.getQtyOfPublications);
// La route permettant de récupérer les likes d'une publication
router.get('/:id/likes', publicationsController.getLikes);
// La route permettant de récupérer l'historique de modification d'une publication
router.get('/:id/history', publicationsController.getHistoryOfEdit);


module.exports = router;