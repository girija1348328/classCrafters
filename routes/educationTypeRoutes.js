const express = require('express');
const router = express.Router();
const educationTypeController = require('../controllers/educationTypeController');

router.post('/', educationTypeController.create);
router.get('/', educationTypeController.getAll);
router.get('/:id', educationTypeController.getById);
router.put('/:id', educationTypeController.update);
router.delete('/:id', educationTypeController.remove);

module.exports = router;
