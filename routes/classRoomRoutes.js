const express = require('express');
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleWare");
const {
  createClassroom,
  getAllClassrooms,
  getClassroomById,
  updateClassroom,
  deleteClassroom,
  addStudentToClassroom,
  removeStudentFromClassroom,
  getClassroomStudents,
  getTeacherClassrooms,
  getStudentClassrooms,
  videoConferenceJitsi,
  videoConferenceZego
} = require('../controllers/classRoomController');
const { route } = require('./authRoutes');

router.post('/', createClassroom);
router.get('/', getAllClassrooms);
router.get('/:id', getClassroomById);   
router.put('/:id', updateClassroom);
router.delete('/:id', deleteClassroom);
router.post('/:id/students', addStudentToClassroom);   
router.delete('/:id/students/:studentId', removeStudentFromClassroom);
router.get('/:id/students', getClassroomStudents);
router.get('/teacher/:teacherId', getTeacherClassrooms);
router.get('/student/:studentId', getStudentClassrooms);
router.get('/jitsi/:room', verifyToken, videoConferenceJitsi);
router.get('/zego/token/:classroomId', verifyToken, videoConferenceZego);

module.exports = router;