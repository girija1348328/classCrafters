const express = require('express');
const FeeStructureController = require('../controllers/feeStructureController');
const router = express.Router();
const  verifyToken  = require('../middlewares/authMiddleWare');

router.post('/', verifyToken, FeeStructureController.create);
router.post('/:id/heads', verifyToken, FeeStructureController.addHeads);
router.post('/:id/installments', verifyToken, FeeStructureController.addInstallments);
router.post('/:id/discounts', verifyToken, FeeStructureController.addDiscounts);
router.post('/:id/fine-rules',verifyToken,FeeStructureController.addFineRules);
router.get('/', verifyToken,FeeStructureController.list);
router.get('/:id/full', verifyToken,FeeStructureController.getFull);

module.exports = router;
