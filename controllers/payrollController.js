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
        message: "Invalid staffId.",
        log
      });
    }

    const salary = await prisma.salaryStructure.findFirst({
      where: { staffId: Number(staffId) },
      select: {
        id: true,
        basicPay: true,        // ✅ correct field
        allowances: true,      // ✅ exists
        deductions: true,
        staff: {
          select: {
            id: true,
            user_id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        createdAt: true,
        updatedAt: true
      }
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

    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: "Salary structure fetched successfully.",
      data: { salary },
      log
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

// exports.getMySalaryStructure = async (req, res) => {
//   const staffId = req.user.id;

//   const salary = await prisma.salaryStructure.findUnique({
//     where: { staffId }
//   });

//   if (!salary) {
//     return sendResponse({
//       res,
//       status: 404,
//       tag: "notFound",
//       message: "Salary structure not defined."
//     });
//   }

//   return sendResponse({
//     res,
//     status: 200,
//     tag: "success",
//     message: "Salary structure fetched successfully.",
//     data: salary
//   });
// };

// exports.deleteSalaryStructure = async (req, res) => {
//   const staffId = Number(req.params.staffId);

//   const payrollExists = await prisma.payroll.findFirst({
//     where: { staffId }
//   });

//   if (payrollExists) {
//     return sendResponse({
//       res,
//       status: 400,
//       tag: "cannotDelete",
//       message: "Cannot delete salary structure after payroll generation."
//     });
//   }

//   await prisma.salaryStructure.delete({
//     where: { staffId }
//   });

//   return sendResponse({
//     res,
//     status: 200,
//     tag: "success",
//     message: "Salary structure deleted successfully."
//   });
// };

exports.generatePayroll = async (req, res) => {
  const log = logger.child({
    handler: "PayrollController.generatePayroll",
    body: req.body,
    userId: req.user.id
  });

  try {
    const { staffId, month, year } = req.body;

    if (!staffId || !month || !year) {
      return sendResponse({
        res,
        status: 400,
        tag: "missingField",
        message: "staffId, month and year are required",
        log
      });
    }

    // Prevent duplicate payroll
    const exists = await prisma.payroll.findUnique({
      where: {
        staffId_month_year: {
          staffId,
          month,
          year
        }
      }
    });

    if (exists) {
      return sendResponse({
        res,
        status: 409,
        tag: "alreadyExists",
        message: "Payroll already generated for this period",
        log
      });
    }

    // Fetch salary structure
    const salary = await prisma.salaryStructure.findUnique({
      where: { staffId }
    });

    if (!salary) {
      return sendResponse({
        res,
        status: 404,
        tag: "salaryNotFound",
        message: "Salary structure not defined",
        log
      });
    }

    const grossSalary =
      salary.basicPay +
      (salary.hra || 0) +
      (salary.allowances || 0);

    const fixedDeduction = salary.deductions || 0;

    // 🔴 Attendance-based deductions should come here later
    const totalDeductions = fixedDeduction;
    const netSalary = grossSalary - totalDeductions;

    const payroll = await prisma.payroll.create({
      data: {
        staffId,
        month,
        year,
        grossSalary,
        totalDeductions,
        netSalary
      }
    });

    // Create fixed deduction item
    if (fixedDeduction > 0) {
      await prisma.payrollItem.create({
        data: {
          payrollId: payroll.id,
          label: "Fixed deductions",
          amount: fixedDeduction,
          type: "DEDUCTION"
        }
      });
    }

    return sendResponse({
      res,
      status: 201,
      tag: "success",
      message: "Payroll generated successfully",
      data: payroll,
      log
    });

  } catch (err) {
    log.error(err);
    return sendResponse({
      res,
      status: 500,
      tag: "serverError",
      message: "Internal server error",
      log
    });
  }
};

exports.getPayrollHistory = async (req, res) => {
  const payrolls = await prisma.payroll.findMany({
    include: {
      staff: true
    },
    orderBy: { generatedAt: "desc" }
  });

  return sendResponse({
    res,
    status: 200,
    tag: "success",
    data: payrolls
  });
};

exports.getMyPayroll = async (req, res) => {
  const staffId = req.user.staffReg.id;
  const { month, year } = req.query;

  const payroll = await prisma.payroll.findUnique({
    where: {
      staffId_month_year: {
        staffId,
        month: Number(month),
        year: Number(year)
      }
    },
    include: { items: true }
  });

  if (!payroll) {
    return sendResponse({
      res,
      status: 404,
      tag: "notFound",
      message: "Payroll not found"
    });
  }

  return sendResponse({
    res,
    status: 200,
    tag: "success",
    data: payroll
  });
};

exports.getPayrollForStaff = async (req, res) => {
  const log = logger.child({
    handler: "PayrollController.getPayrollForStaff",
    params: req.params,
    body: req.body
  });
  try {
    const staffId = Number(req.params.staffId);
    const { month, year } = req.query;

    const payroll = await prisma.payroll.findUnique({
      where: {
        staffId_month_year: {
          staffId,
          month: Number(month),
          year: Number(year)
        }
      },
      include: { items: true }
    });

    if (!payroll) {
      return sendResponse({
        res,
        status: 404,
        tag: "notFound",
        message: "Payroll not found",
        log
      });
    }

    return sendResponse({
      res,
      status: 200,
      tag: "success",
      data: { payroll },
      log
    });

  } catch (err) {
    log.error(err);
    return sendResponse({
      res,
      status: 500,
      tag: "serverError",
      message: "Internal server error.",
      log
    });
  }
};

/* =========================
   MARK PAYROLL AS PAID
========================= */
exports.markPayrollPaid = async (req, res) => {
  const log = logger.child({
    handler: "PayrollController.markPayrollPaid",
    params: req.params,
    body: req.body
  });
  try {
    const payrollId = Number(req.params.id);

    const payroll = await prisma.payroll.update({
      where: { id: payrollId },
      data: { status: "PAID" }
    });

    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: "Payroll marked as PAID",
      data: { payroll },
      log
    });
  } catch (ex) {
    log.error(ex);
    return sendResponse({
      res,
      status: 500,
      tag: "serverError",
      message: "Internal server error.",
      log
    });
  }
};

/* =========================
   PAYROLL SUMMARY
========================= */
exports.getSummary = async (req, res) => {
  const { month, year } = req.query;

  const payrolls = await prisma.payroll.findMany({
    where: {
      month: Number(month),
      year: Number(year)
    }
  });

  const summary = {
    totalPayrolls: payrolls.length,
    paid: payrolls.filter(p => p.status === "PAID").length,
    pending: payrolls.filter(p => p.status === "GENERATED").length,
    totalNetSalary: payrolls.reduce((s, p) => s + p.netSalary, 0)
  };

  return sendResponse({
    res,
    status: 200,
    tag: "success",
    data: summary
  });
};

exports.addItem = async (req, res) => {
  const log = logger.child({
    handler: "PayrollController.addItem",
    params: req.params,
    body: req.body
  });
  try {
    const payrollId = Number(req.params.payrollId);
    const { label, amount, type } = req.body;

    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId }
    });

    if (!payroll) {
      return sendResponse({
        res,
        status: 404,
        tag: "notFound",
        message: "Payroll not found.",
        log
      });
    }

    if (payroll.status === "PAID") {
      return sendResponse({
        res,
        status: 400,
        tag: "payrollLocked",
        message: "Cannot modify PAID payroll",
        log
      });
    }

    const item = await prisma.payrollItem.create({
      data: { payrollId, label, amount, type }
    });

    await recalcPayroll(payrollId);

    return sendResponse({
      res,
      status: 201,
      tag: "success",
      message: "Payroll item added successfully",
      data: { item },
      log
    });
  } catch (ex) {
    log.error(ex);
    return sendResponse({
      res,
      status: 500,
      tag: "serverError",
      message: "Internal server error.",
      log
    });
  }
};

exports.getItems = async (req, res) => {
  const log = logger.child({
    handler: "PayrollController.getItems",
    params: req.params
  });
  try {
    const payrollId = Number(req.params.payrollId);

    const items = await prisma.payrollItem.findMany({
      where: { payrollId }
    });

    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: "Payroll items fetched successfully",
      data: { items },
      log
    });
  } catch (ex) {
    log.error(ex);
    return sendResponse({
      res,
      status: 500,
      tag: "serverError",
      message: "Internal server error.",
      log
    });
  }
};

exports.updateItem = async (req, res) => {
  const log = logger.child({
    handler: "PayrollController.updateItem",
    params: req.params,
    body: req.body,
    userId: req.user.id
  });
  try {
    const itemId = Number(req.params.id);
    const { label, amount } = req.body;

    const item = await prisma.payrollItem.findUnique({
      where: { id: itemId },
      include: { payroll: true }
    });

    if (!item) {
      return sendResponse({
        res,
        status: 404,
        tag: "notFound",
        message: "Payroll item not found.",
        log
      });
    }

    if (!item.payroll) {
      return sendResponse({
        res,
        status: 404,
        tag: "notFound",
        message: "Payroll not found.",
        log
      });
    }

    if (item.payroll.status === "PAID") {
      return sendResponse({
        res,
        status: 400,
        tag: "payrollLocked",
        message: "Cannot modify PAID payroll",
        log
      });
    }

    const updated = await prisma.payrollItem.update({
      where: { id: itemId },
      data: { label, amount }
    });

    await recalcPayroll(item.payrollId);

    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: "Payroll item updated successfully",
      data: { updated },
      log
    });
  } catch (ex) {
    log.error(ex);
    return sendResponse({
      res,
      status: 500,
      tag: "serverError",
      message: "Internal server error.",
      log
    });
  }
};

exports.deleteItem = async (req, res) => {
  const log = logger.child({
    handler: "PayrollController.deleteItem",
    params: req.params,
    userId: req.user.id
  });
  try {
    const itemId = Number(req.params.id);

    const item = await prisma.payrollItem.findUnique({
      where: { id: itemId },
      include: { payroll: true }
    });

    if (!item) {
      return sendResponse({
        res,
        status: 404,
        tag: "notFound",
        message: "Payroll item not found.",
        log
      });
    }

    if (item.payroll.status === "PAID") {
      return sendResponse({
        res,
        status: 400,
        tag: "payrollLocked",
        message: "Cannot modify PAID payroll"
      });
    }

    await prisma.payrollItem.delete({ where: { id: itemId } });
    await recalcPayroll(item.payrollId);

    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: "Payroll item deleted",
      log
    });
  } catch (ex) {
    log.error(ex);
    return sendResponse({
      res,
      status: 500,
      tag: "serverError",
      message: "Internal server error.",
      log
    });
  }
};

async function recalcPayroll(payrollId) {
  try {
    const items = await prisma.payrollItem.findMany({
      where: { payrollId }
    });

    const earnings = items
      .filter(i => i.type === "EARNING")
      .reduce((s, i) => s + i.amount, 0);

    const deductions = items
      .filter(i => i.type === "DEDUCTION")
      .reduce((s, i) => s + i.amount, 0);

    await prisma.payroll.update({
      where: { id: payrollId },
      data: {
        totalDeductions: deductions,
        netSalary: earnings - deductions
      }
    });
  } catch (ex) {
    console.log(ex);
  }
}

