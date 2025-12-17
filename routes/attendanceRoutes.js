const express = require('express');
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleWare");

const {
  recordStudentAttendance,
  staffPunchIn,
  staffPunchOut,
  getStudentAttendance
} = require('../controllers/attendanceController');

// Assignment routes
router.post('/recordStudentAttendance', verifyToken, recordStudentAttendance);
router.post('/staffPunchIn', verifyToken, staffPunchIn);
router.post('/staffPunchOut', verifyToken, staffPunchOut);
router.get('/getStudentAttendance', verifyToken, getStudentAttendance);

module.exports = router;