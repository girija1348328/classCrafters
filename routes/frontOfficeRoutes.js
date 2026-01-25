const express = require('express');

const {createEnquiry,getAllEnquiries,getEnquiryById,getFilteredEnquiries,updateEnquiry,deleteEnquiry,createVisitor,getAllVisitors,getVisitorById,updateVisitor,deleteVisitor,getTodayVisitors,getActiveVisitors,exitVisitor,createDispatch,getDispatch,getDispatchById,updateDispatch,deleteDispatch,createReceivePostal,getReceivePostals,getReceivePostalsById,updateReceivePostal,deleteReceivePostal} = require("../controllers/frontOfficeController.js");
const  verifyToken  = require("../middlewares/authMiddleWare.js");

const router = express.Router();
router.post("/", verifyToken, createEnquiry);
router.get("/", verifyToken, getAllEnquiries);
router.get("/filter", verifyToken, getFilteredEnquiries);

//visitorsbook - SPECIFIC ROUTES BEFORE /:id
router.post("/createVisitor", verifyToken, createVisitor);
router.get("/getVisitor", verifyToken, getAllVisitors);
router.get("/visitorToday", verifyToken, getTodayVisitors);
router.get("/visitorActive", verifyToken, getActiveVisitors);
router.patch("/:id/exit", verifyToken, exitVisitor);

// GENERIC ROUTES AFTER SPECIFIC ONES
router.get("/:id", verifyToken, getEnquiryById);
router.get("/:id", verifyToken, getVisitorById);
router.put("/:id", verifyToken, updateEnquiry);
router.put("/:id", verifyToken, updateVisitor);
router.delete("/:id", verifyToken, deleteEnquiry);
router.delete("/:id", verifyToken, deleteVisitor);

//dispatch
router.post("/createDispatch", verifyToken, createDispatch);
router.get("/getDispatch", verifyToken, getDispatch);
router.get("/getDispatch/:id", verifyToken, getDispatchById);
router.put("/updateDispatch/:id", verifyToken, updateDispatch);
router.delete("/deleteDispatch/:id", verifyToken, deleteDispatch);

//receive postal
router.post("/createReceivePostal", verifyToken, createReceivePostal);
router.get("/getReceivePostals", verifyToken, getReceivePostals);
router.get("/getReceivePostals/:id", verifyToken, getReceivePostalsById);
router.put("/updateReceivePostal/:id", verifyToken, updateReceivePostal);
router.delete("/deleteReceivePostal/:id", verifyToken, deleteReceivePostal);

module.exports = router;