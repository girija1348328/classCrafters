const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyToken = require("../middlewares/authMiddleWare");
const upload = multer({ storage: multer.memoryStorage() });
const {
    createSalaryStructure,
    updateSalaryStructure,
    getSalaryStructure,
    generatePayroll,
    getPayrollForStaff
} = require("../controllers/payrollController");

router.post("/createSalaryStructure", verifyToken, createSalaryStructure);
router.put("/updateSalaryStructure/:staffId", verifyToken, updateSalaryStructure);
router.get("/getSalaryStructure/:staffId", verifyToken, getSalaryStructure);
router.post("/generatePayroll", verifyToken, generatePayroll);
router.get("/getPayrollForStaff/:staffId", verifyToken, getPayrollForStaff);


module.exports = router;