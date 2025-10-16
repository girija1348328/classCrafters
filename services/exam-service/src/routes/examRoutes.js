const exptess = require('express');
const router = exptess.Router();
const examServiceController = require('../controllers/examServiceController');
const {verifyToken,authorizeRole} = require('../middleware/authMiddleWare');

// Teacher-specific route (only teachers can create exams)
router.post(
    '/', 
    verifyToken, 
    authorizeRole(['Teacher','Admin']), 
    examServiceController.createExam
);

// Student-specific routes (students can get and submit exams)
router.get(
    '/', 
    verifyToken, 
    authorizeRole(['Student', 'Teacher']), 
    examServiceController.getExamsForStudent
);


router.post(
    '/submit', 
    verifyToken, 
    authorizeRole(['Student']), 
    examServiceController.submitExam
);
module.exports = router;
