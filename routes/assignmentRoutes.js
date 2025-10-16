const express = require('express');
const router = express.Router();

const {
  createAssignment,
  getClassroomAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');

// Assignment routes
router.post('/assignments', createAssignment);
router.get('/classrooms/:classroomId/assignments', getClassroomAssignments);
router.get('/assignments/:id', getAssignmentById);
router.put('/assignments/:id', updateAssignment);
router.delete('/assignments/:id', deleteAssignment);

module.exports = router;