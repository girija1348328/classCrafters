const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleWare");
const { recordPayment,verifyOnlinePayment, getPaymentsByInstitution } = require("../controllers/feePaymentController");

router.post("/pay", verifyToken, recordPayment);
router.post("/verify", verifyToken, verifyOnlinePayment);
router.get("/payments/institution/:institution_id", verifyToken, getPaymentsByInstitution);


module.exports = router;
