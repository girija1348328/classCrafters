const express = require('express');

const {createEnquiry,getAllEnquiries,getEnquiryById,getFilteredEnquiries,updateEnquiry,deleteEnquiry,createVisitor,getAllVisitors,getVisitorById,updateVisitor,deleteVisitor,getTodayVisitors,getActiveVisitors,exitVisitor} = require("../controllers/frontOfficeController.js");
const  verifyToken  = require("../middlewares/authMiddleWare.js");

const router = express.Router();
router.post("/", verifyToken, createEnquiry);
router.get("/", verifyToken, getAllEnquiries);
router.get("/filter", verifyToken, getFilteredEnquiries);
router.get("/:id", verifyToken, getEnquiryById);
router.put("/:id", verifyToken, updateEnquiry);
router.delete("/:id", verifyToken, deleteEnquiry);


//visitorsbook

router.post("/createVisitor", verifyToken, createVisitor);
router.get("/getVisitor", verifyToken, getAllVisitors);
router.get("/visitorToday", verifyToken, getTodayVisitors);
router.get("/visitorActive", verifyToken, getActiveVisitors);
router.get("/:id", verifyToken, getVisitorById);
router.put("/:id", verifyToken, updateVisitor);
router.patch("/:id/exit", verifyToken, exitVisitor);
router.delete("/:id", verifyToken, deleteVisitor);

module.exports = router;