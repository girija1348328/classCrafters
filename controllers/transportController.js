const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/* =========================================
   VEHICLE CONTROLLER
========================================= */

// Create Vehicle
exports.createVehicle = async (req, res) => {
  try {
    const {
      vehicleNumber,
      type,
      capacity,
      model,
      insuranceNumber,
      insuranceExpiry,
      fitnessExpiry
    } = req.body;

    const vehicle = await prisma.vehicle.create({
      data: {
        vehicleNumber,
        type,
        capacity: Number(capacity),
        model,
        insuranceNumber,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
        fitnessExpiry: fitnessExpiry ? new Date(fitnessExpiry) : null
      }
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Vehicles
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        driver: true,
        route: true
      }
    });

    res.json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.update({
      where: { id: Number(id) },
      data: req.body
    });

    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.vehicle.delete({
      where: { id: Number(id) }
    });

    res.json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================
   DRIVER CONTROLLER
========================================= */

// Create Driver
exports.createDriver = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      licenseNumber,
      licenseExpiry,
      address,
      vehicleId
    } = req.body;

    const driver = await prisma.driver.create({
      data: {
        fullName,
        phone,
        licenseNumber,
        licenseExpiry: new Date(licenseExpiry),
        address,
        vehicleId: vehicleId ? Number(vehicleId) : null
      }
    });

    res.status(201).json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Drivers
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        vehicle: true
      }
    });

    res.json({ success: true, data: drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================
   ROUTE CONTROLLER
========================================= */

// Create Route
exports.createRoute = async (req, res) => {
  try {
    const { routeName, startPoint, endPoint, distanceKm, vehicleId } = req.body;

    const route = await prisma.route.create({
      data: {
        routeName,
        startPoint,
        endPoint,
        distanceKm: distanceKm ? Number(distanceKm) : null,
        vehicleId: vehicleId ? Number(vehicleId) : null
      }
    });

    res.status(201).json({ success: true, data: route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Routes
exports.getRoutes = async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      include: {
        vehicle: true,
        stops: true
      }
    });

    res.json({ success: true, data: routes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================
   STOP CONTROLLER
========================================= */

// Add Stop
exports.addStop = async (req, res) => {
  try {
    const { stopName, arrivalTime, routeId } = req.body;

    const stop = await prisma.stop.create({
      data: {
        stopName,
        arrivalTime,
        routeId: Number(routeId)
      }
    });

    res.status(201).json({ success: true, data: stop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================
   STUDENT TRANSPORT ASSIGNMENT
========================================= */

// Assign Student to Transport
exports.assignStudentTransport = async (req, res) => {
  try {
    const { studentId, routeId, stopId, pickupPoint, dropPoint } = req.body;

    const assignment = await prisma.studentTransport.create({
      data: {
        studentId: Number(studentId),
        routeId: Number(routeId),
        stopId: Number(stopId),
        pickupPoint,
        dropPoint
      }
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Student Transport Details
exports.getStudentTransport = async (req, res) => {
  try {
    const data = await prisma.studentTransport.findMany({
      include: {
        route: true,
        stop: true,
        attendance: true,
        payments: true
      }
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
