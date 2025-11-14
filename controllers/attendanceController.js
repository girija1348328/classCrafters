const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require("../config/logger");
const { sendResponse } = require("../utils/responseLogger.js");

exports.recordStudentPunchIn = async (req, res) => {
    const log = logger.child({
        handler: "RoleController.recordStudentPunchIn",
        body: req.body
    });
    try {
        const {studentRegId,classroomId} = req.body;

    } catch (ex) {

    }
}