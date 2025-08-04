const express = require('express');
const router = express.Router();
const studentRegistrationController = require('../controllers/studentRegistrationController');

router.post('/', studentRegistrationController.create);
router.get('/', studentRegistrationController.getAll);
router.get('/:id', studentRegistrationController.getById);
router.put('/:id', studentRegistrationController.update);
router.delete('/:id', studentRegistrationController.remove);

module.exports = router;