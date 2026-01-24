const { PrismaClient, LeaveStatus, LeaveType } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require("../config/logger");
const { sendResponse } = require("../utils/responseLogger.js");


exports.applyLeave = async (req, res) => {
  const log = logger.child({
    handler: "LeaveController.applyLeave",
    body: req.body,
    userId: req.user.id
  });
  try {
    const userId = req.user.id;

    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate) {
      return sendResponse({
        res,
        status: 400,
        tag: "missingField",
        message: "leaveType, startDate and endDate are required",
        log
      });
    }

    if (!Object.values(LeaveType).includes(leaveType)) {
      return sendResponse({
        res,
        status: 400,
        tag: "invalidLeaveType",
        message: `Invalid leave type. Allowed values are: ${Object.values(LeaveType).join(", ")}`,
        log
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return sendResponse({
        res,
        status: 400,
        tag: "invalidDateRange",
        message: "Start date cannot be after end date",
        log
      });
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        applicantId: userId,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason
      }
    });

    return sendResponse({
      res,
      status: 201,
      tag: "success",
      message: "Leave request submitted successfully",
      data: { leave }
    });
  } catch (err) {
    log.error(err, "Unexpected error in applyLeave.");

    if (err.code === "P2000" || err.code === "P2012") {
      return sendResponse({
        res,
        status: 400,
        tag: "invalidLeaveType",
        message: "Invalid leave type provided.",
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
};

exports.getMyLeaves = async (req, res) => {
  const log = logger.child({
    handler: "LeaveController.getMyLeaves",
    query: req.query,
    userId: req.user.id
  });
  try {
    const userId = req.user.id;

    const leaves = await prisma.leaveRequest.findMany({
      where: { applicantId: userId },
      orderBy: { appliedAt: "desc" }
    });

    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: "Leave history fetched",
      data: { leaves },
      log
    });

  } catch (err) {
    log.error(err, "Unexpected error in getMyLeaves.");

    return sendResponse({
      res,
      status: 500,
      tag: "serverError",
      message: "An internal server error occurred.",
      log
    });
  }
};

exports.getAllLeaves = async (req, res) => {
  const log = logger.child({
    handler: "LeaveController.getAllLeaves",
    query: req.query,
    userId: req.user.id
  });
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const totalCount = await prisma.leaveRequest.count();
    const leaves = await prisma.leaveRequest.findMany({
      include: {
        applicant: { select: { id: true, name: true } },
        reviewedBy: { select: { id: true, name: true } }
      },
      orderBy: { appliedAt: "desc" },
      skip,
      take: limit
    });

    const meta = {
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      pageSize: limit
    };

    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: "All leave requests fetched",
      data: { leaves },
      meta,
      log
    });
  } catch (err) {
    log.error(err, "Unexpected error in getAllLeaves.");

    return sendResponse({
      res,
      status: 500,
      tag: "serverError",
      message: "An internal server error occurred.",
      log
    });
  }
};

exports.reviewLeave = async (req, res) => {
  const log = logger.child({
    handler: "LeaveController.reviewLeave",
    query: req.query,
    userId: req.user.id
  });
  try {
    const reviewerId = req.user.id;
    const leaveId = Number(req.params.leaveId);
    const { status, remarks } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return sendResponse({
        res,
        status: 400,
        tag: "invalidStatus",
        message: "Invalid leave status",
        log
      });
    }

    const leave = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedById: reviewerId,
        remarks
      }
    });

    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: `Leave ${status.toLowerCase()} successfully`,
      data: { leave },
      log
    });
  } catch (err) {
    log.error(err, "Unexpected error in reviewLeave.");

    return sendResponse({
      res,
      status: 500,
      tag: "serverError",
      message: "An internal server error occurred.",
      log
    });
  }
};

exports.cancelLeave = async (req, res) => {
  const log = logger.child({
    handler: "LeaveController.cancelLeave",
    params: req.params,
    user: req.user.id
  });

  try {
    const userId = req.user.id;
    const leaveId = Number(req.params.id);

    if (!leaveId || isNaN(leaveId)) {
      return sendResponse({
        res,
        status: 400,
        tag: "invalidLeaveId",
        message: "Leave ID must be a valid number.",
        log
      });
    }

    const leave = await prisma.leaveRequest.findUnique({
      where: { id: leaveId }
    });

    if (!leave) {
      return sendResponse({
        res,
        status: 404,
        tag: "notFound",
        message: "Leave request not found.",
        log
      });
    }

    // 🔒 Ownership check
    if (leave.applicantId !== userId) {
      return sendResponse({
        res,
        status: 403,
        tag: "forbidden",
        message: "You are not allowed to cancel this leave.",
        log
      });
    }

    // 🚫 Invalid state checks
    if (leave.status === "REJECTED") {
      return sendResponse({
        res,
        status: 400,
        tag: "invalidState",
        message: "Rejected leave cannot be cancelled.",
        log
      });
    }

    if (leave.status === "CANCELLED") {
      return sendResponse({
        res,
        status: 409,
        tag: "alreadyCancelled",
        message: "Leave is already cancelled.",
        log
      });
    }

    // Optional rule: cannot cancel after leave start date
    const today = new Date();
    if (today >= leave.startDate) {
      return sendResponse({
        res,
        status: 400,
        tag: "leaveAlreadyStarted",
        message: "Leave cannot be cancelled after it has started.",
        log
      });
    }

    const cancelledLeave = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status: "CANCELLED",
        reviewedAt: new Date(),
        reviewedById: userId,
        remarks: "Cancelled by applicant"
      }
    });

    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: "Leave cancelled successfully.",
      data: { cancelledLeave },
      log
    });

  } catch (err) {
    log.error(err, "Failed to cancel leave.");
    return sendResponse({
      res,
      status: 500,
      tag: "serverError",
      message: "Internal server error.",
      log
    });
  }
};
