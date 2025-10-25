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
      data: role,
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
  try {
    const roles = await prisma.role.findMany();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Role by ID
exports.getById = async (req, res) => {
  try {
    const role = await prisma.role.findUnique({
      where: { id: Number(req.params.id) }
    });
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json(role);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Role
exports.update = async (req, res) => {
  try {
    const role = await prisma.role.update({
      where: { id: Number(req.params.id) },
      data: {
        name: req.body.name,
        description: req.body.description || null
      }
    });
    res.json(role);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.status(500).json({ error: err.message });
  }
};

// Delete Role
exports.remove = async (req, res) => {
  try {
    await prisma.role.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.status(500).json({ error: err.message });
  }
};
