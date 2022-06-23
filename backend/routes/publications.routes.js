const express = require('express');
const router = express.Router();
const publicationsController = require('../controllers/publications')


router.post('/publications', publicationsController.createPublication);
// router.get('/publications', publicationsController.getAllPublications);
router.get('/:id/publications', publicationsController.getPublicationsOfOnePerson);
router.put('/publications/:id', publicationsController.updatePublication);
router.delete('/publications/:id', publicationsController.deletePublication);

module.exports = router;