const express = require('express');
const router = express.Router();
const publicationsController = require('../controllers/publications')


router.post('/publications', publicationsController.createPublication);
// router.get('/publications', publicationsController.getAllPublications);
router.get('/:id/publications', publicationsController.getPublicationsOfOnePerson);

module.exports = router;