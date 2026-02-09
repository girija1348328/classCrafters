const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleWare");
const { assignFees,getFeeAssignments,getFeeAssignmentById,updateFeeAssignment,deleteFeeAssignment,collectFees } = require("../controllers/feeAssignmentController");        

router.post("/assign", verifyToken, assignFees);
router.get("/", verifyToken, getFeeAssignments);
router.get("/:id", verifyToken, getFeeAssignmentById);
router.put("/:id", verifyToken, updateFeeAssignment);
router.delete("/:id", verifyToken, deleteFeeAssignment);
router.post("/collect", verifyToken, collectFees);
module.exports = router;