const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const logger = require("../config/logger");
const { sendResponse } = require("../utils/responseLogger.js");
const { isJSON } = require("../utils/helper");

exports.create = async (req, res) => {
    const log = logger.child({
        handler: "staffRegistrationController.create",
        body: req.body
    });
    try {
        const { user_id, institution_id, role_in_institution, custom_data } = req.body;

        const registration = await prisma.staffRegistration.create({
            data: {
                user_id,
                institution_id,
                ...(role_in_institution && { role_in_institution }),
                ...(custom_data && { custom_data }),
            },
            include: {
                user: true,
                institution: true
            },
        });

        return sendResponse({
            res,
            status: 201,
            tag: "success",
            message: "Student has been successfully registered in the system.",
            data: {
                registration
            },
            log
        });

    } catch (err) {
        log.error(err, "Unexpected error during staff registration.");

        if (err.code === "P1001") {
            return sendResponse({
                res,
                status: 503,
                tag: "databaseUnavailable",
                message: "Database connection failed. Please try again later.",
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