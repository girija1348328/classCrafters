const express = require('express');
const router = express.Router();
const quizzController = require('../controllers/quizzController');
const verifyToken  = require('../middlewares/authMiddleWare');



router.post('/classrooms/:classroomId/quizzes',verifyToken, quizzController.createQuiz);
router.post('/:quizId/questions', verifyToken, quizzController.addQuestion);
router.put('/:quizId/publish', verifyToken, quizzController.publishQuiz);


router.get('/:quizId',verifyToken, quizzController.getQuizForStudent);
router.get('/classrooms/:classroomId/quizzes',verifyToken, quizzController.getClassroomQuizzes);
router.post('/:quizId/start', verifyToken, quizzController.startQuiz);
router.post('/submit/:attemptId', verifyToken, quizzController.submitQuiz);    


module.exports = router;