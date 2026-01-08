const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const verifyToken  = require('../middlewares/authMiddleWare');

router.post('/',verifyToken, controller.create);
router.get('/',verifyToken, controller.getAll);
router.get('/teacher',verifyToken, controller.getAllTeacher);
router.get('/:id',verifyToken, controller.getById);
router.put('/:id',verifyToken, controller.update);
router.delete('/:id',verifyToken, controller.remove);

module.exports = router;
