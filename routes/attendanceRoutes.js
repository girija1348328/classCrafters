const express = require('express');
const router = express.Router();

const {
  recordStudentAttendance,
  staffPunchIn,
  staffPunchOut
} = require('../controllers/attendanceController');

// Assignment routes
router.post('/recordStudentAttendance', recordStudentAttendance);
router.post('/staffPunchIn', staffPunchIn);
router.post('/staffPunchOut', staffPunchOut);

module.exports = router;