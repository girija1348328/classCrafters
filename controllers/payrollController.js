const { PrismaClient, SalaryStructure, Payroll, PayrollItem } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require("../config/logger");
const { sendResponse } = require("../utils/responseLogger.js");

exports.createSalaryStructure = async (req, res) => {
    const log = logger.child({
        handler: "SalaryStructureController.create",
        body: req.body,
        userId: req.user.id
    });

    try {
        const { userId, basicPay, hra, allowances, deductions } = req.body;

        if (!userId || !basicPay) {
            return sendResponse({
                res,
                status: 400,
                tag: "missingField",
                message: "staffId and basicPay are required.",
                log
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                staffRegs: true
            }
        });

        if (!user) {
            return sendResponse({
                res,
                status: 404,
                tag: "notFound",
                message: "User not found.",
                log
            });
        }

        const staff = user.staffRegs[0];

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
            data: salary,
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
