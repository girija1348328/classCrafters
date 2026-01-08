const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require("../config/logger");
const { sendResponse } = require("../utils/responseLogger.js");

exports.create = async (req, res) => {
  const log = logger.child({
    handler: "UserController.create",
    body: req.body
  });
  try {
    const { name, email, role_id } = req.body;

    if (!name || !email || !role_id) {
      return sendResponse({
        res,
        status: 400,
        tag: "missingField",
        message: "Missing required fields: name, email, or role_id.",
        log
      });
    }

    const duplicateEmail = await prisma.user.findUnique({ where: { email } });
    if (duplicateEmail) {
      return sendResponse({
        res,
        status: 409,
        tag: "conflict",
        message: "A user with this email already exists.",
        log
      });
    }

    const role = await prisma.role.findUnique({ where: { id: role_id } });
    if (!role) {
      return sendResponse({
        res,
        status: 404,
        tag: "roleNotFound",
        message: "No role found with the specified _id.",
        log
      });
    }

    const user = await prisma.user.create({ data: { name, email, role_id: role.id } });

    return sendResponse({
      res,
      status: 201,
      tag: "success",
      message: "User created successfully.",
      data: {
        user
      },
      log
    });
  } catch (err) {
    log.error(err, "Unexpected error during user creation.");

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
};

exports.getAll = async (req, res) => {
  const log = logger.child({
    handler: "UserController.getAll",
    query: req.query
  });
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const totalCount = await prisma.user.count();

    const users = await prisma.user.findMany({
      include: { role: true },
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
      message: "Users retrieved successfully.",
      data: { users },
      meta,
      log
    });
  } catch (err) {
    log.error(err, "Unexpected error during fetching users.");

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
};

exports.getAllTeacher = async (req, res) => {
  const log = logger.child({
    handler: "UserController.getAllTeacher",
    query: req.query
  });
  try {
    const teachers = await prisma.user.findMany({
      where: { role: { name: 'teacher' } },
      include: { role: true }
    });
    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: "Teachers retrieved successfully.",
      data: { teachers },
      log
    });
  } catch (err) {
    log.error(err, "Unexpected error during fetching teachers."); 
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
};

exports.getById = async (req, res) => {
  const log = logger.child({
    handler: "UserController.getById",
    params: req.params
  });
  try {
    const userId = Number(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
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

    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: "User retrieved successfully.",
      data: { user },
      log
    });
  } catch (err) {
    log.error(err, "Unexpected error during fetching user.");

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
};

exports.update = async (req, res) => {
  const log = logger.child({
    handler: "UserController.update",
    params: req.params,
    body: req.body
  });
  try {
    const { name, email, roleId } = req.body;
    const userId = Number(req.params.id);

    if (roleId && isNaN(roleId)) {
      return sendResponse({
        res,
        status: 400,
        tag: "invalidId",
        message: "Role ID must be a number.",
        log
      });
    }

    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
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

    user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(roleId && { roleId })
      }
    });
    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: "User updated successfully.",
      data: { user },
      log
    });
  } catch (err) {
    log.error(err, "Unexpected error during updating user.");

    if (err.code === "P1001") {
      return sendResponse({
        res,
        status: 503,
        tag: "databaseUnavailable",
        message: "Database connection failed. Please try again later.",
        log
      });
    }

    if (err.code === 'P2025') {
      return sendResponse({
        res,
        status: 404,
        tag: "notFound",
        message: "Role not found.",
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

exports.remove = async (req, res) => {
  const log = logger.child({
    handler: "UserController.remove",
    params: req.params
  });

  try {
    const userId = Number(req.params.id);

    // 🔹 Validate ID
    if (isNaN(userId)) {
      return sendResponse({
        res,
        status: 400,
        tag: "invalidId",
        message: "User ID must be a number.",
        log
      });
    }

    // 🔹 Delete User
    await prisma.user.delete({
      where: { id: userId }
    });

    // 🔹 Success
    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: "User deleted successfully.",
      data: { userId },
      log
    });

  } catch (err) {
    // Log actual Prisma error for debugging
    console.error("DELETE USER ERROR =>", err);
    log.error(err, "Unexpected error during user deletion.");

    // 🔹 User not found
    if (err.code === "P2025") {
      return sendResponse({
        res,
        status: 404,
        tag: "userNotFound",
        message: "User not found.",
        log
      });
    }

    // 🔹 Foreign key constraint error
    if (err.code === "P2003") {
      return sendResponse({
        res,
        status: 409,
        tag: "fkConstraint",
        message: "User cannot be deleted because related records exist.",
        log
      });
    }

    // 🔹 Database unreachable
    if (err.code === "P1001") {
      return sendResponse({
        res,
        status: 503,
        tag: "databaseUnavailable",
        message: "Database connection failed. Please try again later.",
        log
      });
    }

    // 🔹 Fallback for all unknown errors
    return sendResponse({
      res,
      status: 500,
      tag: "serverError",
      message: "An internal server error occurred.",
      log
    });
  }
};

