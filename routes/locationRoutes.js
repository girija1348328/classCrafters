const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.post('/', locationController.create);
router.get('/', locationController.getAll);
router.get('/:id', locationController.getById);
router.put('/:id', locationController.update);
router.delete('/:id', locationController.remove);

module.exports = router;
