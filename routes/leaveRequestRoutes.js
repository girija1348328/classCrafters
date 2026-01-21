const express = require('express');
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleWare");

const {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    reviewLeave
} = require("../controllers/leaveController");

router.post("/applyLeave", verifyToken, applyLeave);
router.get("/getMyLeaves", verifyToken, getMyLeaves);
router.get("/getAllLeaves", verifyToken, getAllLeaves);
router.put("/reviewLeave/:leaveId", verifyToken, reviewLeave);

module.exports = router;