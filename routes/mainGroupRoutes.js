const express = require('express');
const router = express.Router();
const mainGroupController = require('../controllers/mainGroupController');

router.post('/', mainGroupController.create);
router.get('/', mainGroupController.getAll);
router.get('/:id', mainGroupController.getById);
router.put('/:id', mainGroupController.update);
router.delete('/:id', mainGroupController.remove);

module.exports = router;
