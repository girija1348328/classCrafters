const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleWare");
const { recordPayment,verifyOnlinePayment } = require("../controllers/feePaymentController");

router.post("/pay", verifyToken, recordPayment);
router.post("/verify", verifyToken, verifyOnlinePayment);

module.exports = router;
