const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

router.post('/', roleController.create);
router.get('/', roleController.getAll);
router.get('/:id', roleController.getById);
router.put('/:id', roleController.update);
router.delete('/:id', roleController.remove);

module.exports = router;
