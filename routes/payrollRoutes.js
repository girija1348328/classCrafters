const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyToken = require("../middlewares/authMiddleWare");
const upload = multer({ storage: multer.memoryStorage() });
const {
    createSalaryStructure,
    updateSalaryStructure,
    getSalaryStructure
} = require("../controllers/payrollController");

router.post("/createSalaryStructure", verifyToken, createSalaryStructure);
router.put("/updateSalaryStructure/:staffId", verifyToken, updateSalaryStructure);
router.get("/getSalaryStructure/:staffId", verifyToken, getSalaryStructure);


module.exports = router;