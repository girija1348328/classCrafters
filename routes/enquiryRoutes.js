const express = require('express');

const {createEnquiry,getAllEnquiries,getEnquiryById,getFilteredEnquiries,updateEnquiry,deleteEnquiry} = require("../controllers/enquiryController.js");
const  verifyToken  = require("../middlewares/authMiddleWare.js");

const router = express.Router();
router.post("/", verifyToken, createEnquiry);
router.get("/", verifyToken, getAllEnquiries);
router.get("/filter", verifyToken, getFilteredEnquiries);
router.get("/:id", verifyToken, getEnquiryById);
router.put("/:id", verifyToken, updateEnquiry);
router.delete("/:id", verifyToken, deleteEnquiry);

module.exports = router;