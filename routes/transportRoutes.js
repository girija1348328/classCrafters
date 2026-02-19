const express = require("express");
const router = express.Router();
const transportController = require("../controllers/transportController");
const verifyToken = require("../middlewares/authMiddleWare");


// Vehicle
router.post("/vehicle", verifyToken, transportController.createVehicle);
router.get("/vehicle", verifyToken, transportController.getVehicles);
router.put("/vehicle/:id", verifyToken, transportController.updateVehicle);
router.delete("/vehicle/:id", verifyToken, transportController.deleteVehicle);

// Driver
router.post("/driver", verifyToken, transportController.createDriver);
router.get("/driver", verifyToken, transportController.getDrivers);

// Route
router.post("/route", verifyToken, transportController.createRoute);
router.get("/route", verifyToken, transportController.getRoutes);

// Stop
router.post("/stop", verifyToken, transportController.addStop);

// Student Transport
router.post("/assign", verifyToken, transportController.assignStudentTransport);
router.get("/student-transport", verifyToken, transportController.getStudentTransport);

module.exports = router;
