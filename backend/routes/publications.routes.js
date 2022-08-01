const express = require('express');
const router = express.Router();
const publicationsController = require('../controllers/publications');
// const checkInput = require('../middlewares/checkInput');
const multer = require('../middlewares/multer-config');
const sanitize = require('../middlewares/sanitizer');


router.post('/', multer, sanitize, publicationsController.createPublication);
router.put('/:id', multer, sanitize, publicationsController.updatePublication);
router.delete('/:id', publicationsController.deletePublication);
router.get('/', publicationsController.getAllPublications);
router.post('/:id', publicationsController.likePublication);
router.get('/:id', publicationsController.getLikes);
// router.get('/:id', publicationsController.getOnePublication);


module.exports = router;