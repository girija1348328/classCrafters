const express = require('express');
const router = express.Router();

const {
  submitAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
  getStudentSubmissions
} = require('../controllers/submissionController');

router.post('/', submitAssignment);
router.get('/assignments/:assignmentId', getAssignmentSubmissions);
router.put('/:id/grade', gradeSubmission);
router.get('/students/:studentId', getStudentSubmissions);

module.exports = router;
