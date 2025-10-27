const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require("../config/logger");
const { sendResponse } = require("../utils/responseLogger.js");

// Create a Role
exports.create = async (req, res) => {
  const log = logger.child({
    handler: "RoleController.create",
    body: req.body
  });

  try {
    const { name, description } = req.body;

    if (!name) {
      return sendResponse({
        res,
        status: 400,
        tag: "missingField",
        message: "Role name is required.",
        log
      });
    }

    const duplicateRole = await prisma.role.findFirst({ where: { name } });

    if (duplicateRole) {
      return sendResponse({
        res,
        status: 409,
        tag: "conflict",
        message: "A role with this name already exists.",
        log
      });
    }

    const role = await prisma.role.create({
      data: { name, description: description || null }
    });

    return sendResponse({
      res,
      status: 201,
      tag: "success",
      message: "Role created successfully.",
      data: {
        role
      },
      log
    });

  } catch (err) {
    log.error(err, "Unexpected error during role creation.");

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

// Get All Roles
exports.getAll = async (req, res) => {
  const log = logger.child({
    handler: "RoleController.getAll",
    query: req.query
  });

  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const totalCount = await prisma.role.count();

    const roles = await prisma.role.findMany({
      skip,
      take: limit
    });

    // Meta info for frontend
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
      message: "Roles retrieved successfully.",
      data: { roles },
      meta,
      log
    });

  } catch (err) {
    log.error(err, "Unexpected error during fetching roles.");

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

// Get Role by ID
exports.getById = async (req, res) => {
  const log = logger.child({
    handler: "RoleController.getById",
    params: req.params
  });
  try {
    const roleId = Number(req.params.id);

    if (isNaN(roleId)) {
      return sendResponse({
        res,
        status: 400,
        tag: "invalidId",
        message: "Role ID must be a number.",
        log
      });
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
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
      status: 200,
      tag: "success",
      message: "Role retrieved successfully.",
      data: { role },
      log
    });
  } catch (err) {
    log.error(err, "Unexpected error during fetching role.");

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

// Update Role
exports.update = async (req, res) => {
  const log = logger.child({
    handler: "RoleController.update",
    params: req.params,
    body: req.body
  });
  try {
    const { name, description } = req.body;
    const roleId = Number(req.params.id);

    if (isNaN(roleId)) {
      return sendResponse({
        res,
        status: 400,
        tag: "invalidId",
        message: "Role ID must be a number.",
        log
      });
    }

    if (!name) {
      return sendResponse({
        res,
        status: 400,
        tag: "invalidInput",
        message: "Role name is required.",
        log
      });
    }

    const role = await prisma.role.update({
      where: { id: roleId },
      data: {
        name,
        description: description || null
      }
    });

    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: "Role updated successfully.",
      data: { role },
      log
    });
  } catch (err) {
    log.error(err, "Unexpected error during updating role.");

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

// Delete Role
exports.remove = async (req, res) => {
  const log = logger.child({
    handler: "RoleController.remove",
    params: req.params
  });
  try {
    const roleId = Number(req.params.id);

    if (isNaN(roleId)) {
      return sendResponse({
        res,
        status: 400,
        tag: "invalidId",
        message: "Role ID must be a number.",
        log
      });
    }

    await prisma.role.delete({
      where: { id: roleId }
    });

    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: "Role deleted successfully.",
      data: { roleId },
      log
    });
  } catch (err) {
    log.error(err, "Unexpected error during deleting role.");

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
