const express = require('express');
const router = express.Router();
const phaseController = require('../controllers/phaseController');

router.post('/', phaseController.create);
router.get('/', phaseController.getAll);
router.get('/:id', phaseController.getById);
router.put('/:id', phaseController.update);
router.delete('/:id', phaseController.remove);

module.exports = router;
