const { PrismaClient, AttendanceStatus } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require("../config/logger");
const { sendResponse } = require("../utils/responseLogger.js");

exports.recordStudentAttendance = async (req, res) => {
    const log = logger.child({
        handler: "AttendanceController.recordStudentAttendance",
        body: req.body
    });
    try {
        const { studentRegId, classroomId, status, remarks } = req.body;
        const { id } = req.user;

        if (!studentRegId || !classroomId || !status) {
            return sendResponse({
                res,
                status: 400,
                tag: "missingField",
                message: "Missing required fields: studentRegId, classroomId, or status.",
                log
            });
        }

        if (!Object.values(AttendanceStatus).includes(status)) {
            return sendResponse({
                res,
                status: 400,
                tag: "invalidStatus",
                message: `Invalid status value. Allowed values are: ${Object.values(AttendanceStatus).join(", ")}`,
                log
            });
        }

        const student = await prisma.user.findUnique({ where: { id: studentRegId } });
        if (!student) {
            return sendResponse({
                res,
                status: 404,
                tag: "notFound",
                message: "No student found with the specified student regd. id.",
                log
            });
        }

        const classRoom = await prisma.classroom.findUnique({ where: { id: classroomId } });
        if (!classRoom) {
            return sendResponse({
                res,
                status: 404,
                tag: "notFound",
                message: "No classroom found with the specified student classroom id.",
                log
            });
        }

        const attendance = await prisma.user.create(
            {
                data: {
                    studentRegId,
                    classroomId,
                    status,
                    ...(remarks && { remarks }),
                    markedById: id
                }
            }
        );


        return sendResponse({
            res,
            status: 201,
            tag: "success",
            message: "Attendance have recorded successfully.",
            data: {
                attendance
            },
            log
        });
    } catch (err) {
        log.error(err, "Unexpected error while recording student attendance.");
        if (err.code === "P2002") {
            return sendResponse({
                res,
                status: 409,
                tag: "duplicateAttendance",
                message: "Attendance already recorded for this student in this classroom today.",
                log
            });
        }

        if (err.code === "P2000" || err.code === "P2012") {
            return sendResponse({
                res,
                status: 400,
                tag: "invalidStatus",
                message: "Invalid attendance status provided.",
                log
            });
        }

        return sendResponse({
            res,
            status: 500,
            tag: "serverError",
            message: "An internal server error occurred.",
            log
        });
    }
}

exports.staffPunchIn = async (req, res) => {
    const log = logger.child({
        handler: "AttendanceController.staffPunchIn",
        body: req.body
    });
    try {
        const { staffRegId, institutionId, remarks } = req.body;
        const { id } = req.user;

        if (!staffRegId || !institutionId) {
            return sendResponse({
                res,
                status: 400,
                tag: "missingField",
                message: "Missing required fields: staffRegId, institutionId.",
                log
            });
        }

        const staffRegd = await prisma.staffRegistration.findUnique({ where: { id: staffRegId } });
        if (!staffRegd) {
            return sendResponse({
                res,
                status: 404,
                tag: "notFound",
                message: "No staff found with the specified regd. id.",
                log
            });
        }

        const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
        if (!institution) {
            return sendResponse({
                res,
                status: 404,
                tag: "notFound",
                message: "No institution found with the specified id.",
                log
            });
        }

        const attendance = await prisma.user.create(
            {
                data: {
                    staffRegId,
                    institutionId,
                    ...(remarks && { remarks }),
                    punchInById: id
                }
            }
        );

        return sendResponse({
            res,
            status: 201,
            tag: "success",
            message: "Attendance have recorded successfully.",
            data: {
                attendance
            },
            log
        });
    } catch (ex) {
        log.error(err, "Unexpected error while recording staff attendance.");
        if (err.code === "P2002") {
            return sendResponse({
                res,
                status: 409,
                tag: "duplicateAttendance",
                message: "Attendance already recorded for this student in this classroom today.",
                log
            });
        }

        if (err.code === "P2000" || err.code === "P2012") {
            return sendResponse({
                res,
                status: 400,
                tag: "invalidStatus",
                message: "Invalid attendance status provided.",
                log
            });
        }

        return sendResponse({
            res,
            status: 500,
            tag: "serverError",
            message: "An internal server error occurred.",
            log
        });
    }
}