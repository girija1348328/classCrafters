const express = require('express');

const {createEnquiry,getAllEnquiries,getEnquiryById,getFilteredEnquiries,updateEnquiry,deleteEnquiry,createVisitor,getAllVisitors,getVisitorById,updateVisitor,deleteVisitor,getTodayVisitors,getActiveVisitors,exitVisitor,createDispatch,getDispatch,getDispatchById,updateDispatch,deleteDispatch,createReceivePostal,getReceivePostals,getReceivePostalsById,updateReceivePostal,deleteReceivePostal,createComplaint,getComplaints,getComplaintById,deleteComplaint,updateComplaint} = require("../controllers/frontOfficeController.js");
const  verifyToken  = require("../middlewares/authMiddleWare.js");

const router = express.Router();

// ENQUIRY ROUTES - Specific before generic
router.post("/createEnquiry", verifyToken, createEnquiry);
router.get("/enquiries/filter", verifyToken, getFilteredEnquiries);
router.get("/enquiries", verifyToken, getAllEnquiries);
router.get("/enquiry/:id", verifyToken, getEnquiryById);
router.put("/enquiry/:id", verifyToken, updateEnquiry);
router.delete("/enquiry/:id", verifyToken, deleteEnquiry);

// VISITOR ROUTES - SPECIFIC BEFORE GENERIC
router.post("/createVisitor", verifyToken, createVisitor);
router.get("/getVisitor", verifyToken, getAllVisitors);
router.get("/visitorToday", verifyToken, getTodayVisitors);
router.get("/visitorActive", verifyToken, getActiveVisitors);
router.patch("/:id/exit", verifyToken, exitVisitor);
router.put("/:id/visitor", verifyToken, updateVisitor);
router.delete("/:id/visitor", verifyToken, deleteVisitor);

// DISPATCH ROUTES
router.post("/createDispatch", verifyToken, createDispatch);
router.get("/getDispatch", verifyToken, getDispatch);
router.get("/getDispatch/:id", verifyToken, getDispatchById);
router.put("/updateDispatch/:id", verifyToken, updateDispatch);
router.delete("/deleteDispatch/:id", verifyToken, deleteDispatch);

// RECEIVE POSTAL ROUTES
router.post("/createReceivePostal", verifyToken, createReceivePostal);
router.get("/getReceivePostals", verifyToken, getReceivePostals);
router.get("/getReceivePostals/:id", verifyToken, getReceivePostalsById);
router.put("/updateReceivePostal/:id", verifyToken, updateReceivePostal);
router.delete("/deleteReceivePostal/:id", verifyToken, deleteReceivePostal);


//COMPLAIN ROUTES
router.post("/createComplain", verifyToken, createComplaint);
router.get("/getComplains", verifyToken, getComplaints);
router.get("/getComplain/:id", verifyToken, getComplaintById);
router.put("/updateComplain/:id", verifyToken, updateComplaint);
router.delete("/deleteComplain/:id", verifyToken, deleteComplaint);


module.exports = router;