const express = require('express');
const router = express.Router();
const subGroupController = require('../controllers/subGroupController');

router.post('/', subGroupController.create);
router.get('/', subGroupController.getAll);
router.get('/:id', subGroupController.getById);
router.put('/:id', subGroupController.update);
router.delete('/:id', subGroupController.remove);

module.exports = router;
