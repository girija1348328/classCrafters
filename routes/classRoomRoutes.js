const express = require('express');
const router = express.Router();
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
  videoConferenceJetsi
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
router.get('/jitsi/:room', videoConferenceJetsi);

module.exports = router;