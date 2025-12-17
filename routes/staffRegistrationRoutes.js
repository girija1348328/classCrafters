const express = require('express');
const router = express.Router();
const staffRegistrationController = require('../controllers/staffRegistrationController');

router.post('/', staffRegistrationController.create);

module.exports = router;