const { PrismaClient, SalaryStructure, Payroll, PayrollItem } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require("../config/logger");
const { sendResponse } = require("../utils/responseLogger.js");

exports.createSalaryStructure = async (req, res) => {
    const log = logger.child({
        handler: "PayrollController.createSalaryStructure",
        body: req.body,
        userId: req.user.id
    });

    try {
        const { staffId, basicPay, hra, allowances, deductions } = req.body;

        if (!staffId || !basicPay) {
            return sendResponse({
                res,
                status: 400,
                tag: "missingField",
                message: "staffId and basicPay are required.",
                log
            });
        }

        const staff = await prisma.staffRegistration.findUnique({
            where: { id: staffId }
        });

        if (!staff) {
            return sendResponse({
                res,
                status: 404,
                tag: "notFound",
                message: "Staff not found.",
                log
            });
        }

        const existing = await prisma.salaryStructure.findUnique({
            where: { staffId: staff.id }
        });

        if (existing) {
            return sendResponse({
                res,
                status: 409,
                tag: "alreadyExists",
                message: "Salary structure already exists for this staff.",
                log
            });
        }

        const salary = await prisma.salaryStructure.create({
            data: {
                staffId: staff.id,
                basicPay,
                hra,
                allowances,
                deductions
            }
        });

        return sendResponse({
            res,
            status: 201,
            tag: "success",
            message: "Salary structure created successfully.",
            data: { salary },
            log
        });

    } catch (err) {
        log.error(err, "Failed to create salary structure.");
        return sendResponse({
            res,
            status: 500,
            tag: "serverError",
            message: "Internal server error.",
            log
        });
    }
};

exports.updateSalaryStructure = async (req, res) => {
    const log = logger.child({
        handler: "PayrollController.updateSalaryStructure",
        params: req.params,
        body: req.body
    });

    try {
        const staffId = Number(req.params.staffId);
        const { basicPay, hra, allowances, deductions } = req.body;

        if (isNaN(staffId)) {
            return sendResponse({
                res,
                status: 400,
                tag: "invalidStaffId",
                message: "Invalid staffId.",
                log
            });
        }

        let salary = await prisma.salaryStructure.findUnique({
            where: { staffId }
        });

        if (!salary) {
            return sendResponse({
                res,
                status: 404,
                tag: "notFound",
                message: "Salary structure not found.",
                log
            });
        }

        salary = await prisma.salaryStructure.update({
            where: { staffId },
            data: {
                ...(basicPay && { basicPay }),
                ...(hra && { hra }),
                ...(allowances && { allowances }),
                ...(deductions && { deductions })
            }
        });

        return sendResponse({
            res,
            status: 200,
            tag: "success",
            message: "Salary structure updated successfully.",
            data: { salary },
            log
        });

    } catch (err) {
        log.error(err, "Failed to update salary structure.");

        if (err.code === "P2025") {
            return sendResponse({
                res,
                status: 404,
                tag: "notFound",
                message: "Salary structure not found.",
                log
            });
        }

        return sendResponse({
            res,
            status: 500,
            tag: "serverError",
            message: "Internal server error.",
            log
        });
    }
};

exports.getSalaryStructure = async (req, res) => {
    const log = logger.child({
        handler: "PayrollController.getSalaryStructure",
        params: req.params,
        body: req.body
    });
    try {
        const staffId = Number(req.params.staffId);

        if (isNaN(staffId)) {
            return sendResponse({
                res,
                status: 400,
                tag: "invalidStaffId",
                message: "Invalid staffId."
            });
        }

        const salary = await prisma.salaryStructure.findUnique({
            where: { staffId },
            include: {
                staff: {
                    select: {
                        id: true,
                        user_id: true,
                        user: 1
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        if (!salary) {
            return sendResponse({
                res,
                status: 404,
                tag: "notFound",
                message: "Salary structure not found."
            });
        }

        return sendResponse({
            res,
            status: 200,
            tag: "success",
            message: "Salary structure fetched successfully.",
            data: salary
        });

    } catch (err) {
        log.error(err, "Failed to get salary structure.");
        return sendResponse({
            res,
            status: 500,
            tag: "serverError",
            message: "Internal server error.",
            log
        });
    }
};

