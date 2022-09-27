const express = require('express');
const router = express.Router();
const publicationsController = require('../controllers/publications');
const multer = require('../middlewares/multer-config');
const sanitize = require('../middlewares/sanitizer');


router.post('/', multer, sanitize, publicationsController.createPublication);
router.put('/:id', multer, sanitize, publicationsController.updatePublication);
router.delete('/:id', publicationsController.deletePublication);
router.get('/', publicationsController.getAllPublications);
router.post('/:id/likes', publicationsController.likePublication);
router.get('/count', publicationsController.getQtyOfPublications);
router.get('/:id/likes', publicationsController.getLikes);
router.get('/:id/history', publicationsController.getHistoryOfEdit);


module.exports = router;