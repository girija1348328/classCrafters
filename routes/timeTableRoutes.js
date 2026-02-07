const express = require("express");
const router = express.Router();

const timeTableController = require("../controllers/timeTableController");

router.post("/timetable", timeTableController.createTimetable);
router.get("/timetable/class/:classId", timeTableController.getTimetableByClass);
router.get("/timetable/teacher/:teacherId", timeTableController.getTimetableByTeacher);
router.put("/timetable/:id", timeTableController.updateTimetable);
router.delete("/timetable/:id", timeTableController.deleteTimetable);

module.exports = router;
