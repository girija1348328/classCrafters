const express = require('express');
const router = express.Router();
const customFieldController = require('../controllers/customFieldController');

router.post('/', customFieldController.create);
router.get('/', customFieldController.getAll);
router.get('/:id', customFieldController.getById);
router.put('/:id', customFieldController.update);
router.delete('/:id', customFieldController.remove);

module.exports = router;
