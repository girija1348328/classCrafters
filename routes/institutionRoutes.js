const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institutionController');

router.post('/', institutionController.create);
router.get('/', institutionController.getAll);
router.get('/:id', institutionController.getById);
router.put('/:id', institutionController.update);
router.delete('/:id', institutionController.remove);

module.exports = router;
