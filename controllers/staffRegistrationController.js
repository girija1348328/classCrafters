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

exports.getAllStaffRegistrations = async (req, res) => {
    try {
        const staffRegistrations = await prisma.staffRegistration.findMany({
            include: {
                user: true,
                institution: true,
              
               
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        res.json({ staffRegistrations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStaffRegistrationById = async (req, res) => {
    try {
        const { id } = req.params;

        const staffRegistration = await prisma.staffRegistration.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: true,
                institution: true,
            },
        });

        if (!staffRegistration) {
            return res.status(404).json({ error: 'Staff registration not found' });
        }

        res.json({ staffRegistration });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateStaffRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, institution_id, role_id, subgroup_id, custom_data } = req.body;

        const staffRegistration = await prisma.staffRegistration.update({
            where: { id: parseInt(id) },
            data: {
                user_id,
                institution_id,
                role_id,
                subgroup_id,
                custom_data
            },
            include: {
                user: true,
                institution: true,
                role: true,
                subgroup: true,
                custom_data: true
            },
        });

        res.json({
            message: 'Staff registration updated successfully',
            staffRegistration
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteStaffRegistration = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.staffRegistration.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Staff registration deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};  
