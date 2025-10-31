const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleWare");
const { assignFees } = require("../controllers/feeAssignmentController");

router.post("/assign", verifyToken, assignFees);

module.exports = router;