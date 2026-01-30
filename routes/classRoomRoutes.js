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
  videoConferenceZego,
  getStudentsByClassroomId,
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject
} = require('../controllers/classRoomController');
const { route } = require('./authRoutes');

router.get('/getStudentsByClassroomId', verifyToken, getStudentsByClassroomId);
router.post('/', createClassroom);
router.post('/subject/:classroomId', createSubject);
router.get('/', getAllClassrooms);
router.get('/allSubjects', getAllSubjects);
router.get('/:id', getClassroomById);
router.put('/:id', updateClassroom);
router.delete('/:id', deleteClassroom);
router.get('/:id/subject', getSubjectById);
router.put('/:id/subject', updateSubject);
router.delete('/:id/subject', deleteSubject);
router.post('/:id/students', addStudentToClassroom);   
router.delete('/:id/students/:studentId', removeStudentFromClassroom);
router.get('/:id/students', getClassroomStudents);
router.get('/teacher/:teacherId', getTeacherClassrooms);
router.get('/student/:studentId', getStudentClassrooms);
router.get('/jitsi/:room', verifyToken, videoConferenceJitsi);
router.get('/zego/token/:classroomId', verifyToken, videoConferenceZego);

module.exports = router;
