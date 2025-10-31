const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleWare");
const { recordPayment } = require("../controllers/feePaymentController");

router.post("/pay", verifyToken, recordPayment);

module.exports = router;
