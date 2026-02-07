const express = require('express');
const router = express.Router();
const staffRegistrationController = require('../controllers/staffRegistrationController');

router.post('/', staffRegistrationController.create);
router.get('/', staffRegistrationController.getAllStaffRegistrations);
router.get('/:id', staffRegistrationController.getStaffRegistrationById);
router.put('/:id', staffRegistrationController.updateStaffRegistration);    
router.delete('/:id', staffRegistrationController.deleteStaffRegistration);


module.exports = router;