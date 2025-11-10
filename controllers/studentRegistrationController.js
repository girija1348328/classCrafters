const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { isJSON } = require("../utils/helper");

// Create Student Registration
exports.create = async (req, res) => {
  const log = logger.child({
    handler: "StudentRegistrationController.create",
    body: req.body
  });
  try {
    const { user_id, institution_id, phase_id, subgroup_id, custom_data } = req.body;

    console.log(typeof user_id, typeof institution_id, typeof phase_id, typeof subgroup_id);
    if (!user_id || !institution_id || !phase_id || !subgroup_id) {
      return sendResponse({
        res,
        status: 400,
        tag: "missingField",
        message: "User ID, Institution ID, Phase ID, and Subgroup ID are required.",
        log
      });
    }

    const userExists = await prisma.user.findUnique({ where: { id: user_id } });
    if (!userExists) {
      return sendResponse({
        res,
        status: 404,
        tag: "userNotFound",
        message: "A user with this ID does not exist.",
        log
      });
    }

    const institutionExists = await prisma.institution.findUnique({
      where: { id: institution_id },
    });
    if (!institutionExists) {
      return sendResponse({
        res,
        status: 404,
        tag: "institutionNotFound",
        message: "An institution with this ID does not exist.",
        log
      });
    }

    const phaseExists = await prisma.phase.findUnique({
      where: { id: phase_id },
    });
    if (!phaseExists) {
      return sendResponse({
        res,
        status: 404,
        tag: "phaseNotFound",
        message: "A phase with this ID does not exist.",
        log
      });
    }

    const subgroupExists = await prisma.subGroup.findUnique({
      where: { id: subgroup_id },
    });
    if (!subgroupExists) {
      return sendResponse({
        res,
        status: 404,
        tag: "subgroupNotFound",
        message: "A subgroup with this ID does not exist.",
        log
      });
    }

    const registration = await prisma.studentRegistration.create({
      data: {
        user_id,
        institution_id,
        phase_id,
        subgroup_id,
        custom_data: custom_data || null,
      },
      include: {
        user: true,
        institution: true,
        phase: true,
        subgroup: true,
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
    log.error(err, "Unexpected error during student registration.");

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

// Get All Student Registrations
exports.getAll = async (req, res) => {
  const log = logger.child({
    handler: "StudentRegistrationController.getAll",
    query: req.query
  });
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const totalCount = await prisma.studentRegistration.count();

    const registrations = await prisma.studentRegistration.findMany({
      include: {
        user: true,
        institution: true,
        phase: true,
        subgroup: true,
      },
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
      message: "Student registrations retrieved successfully.",
      data: { registrations },
      meta,
      log
    });
  } catch (err) {
    log.error(err, "Unexpected error occurred while fetching student registrations.");

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

// Get Student Registration by ID
exports.getById = async (req, res) => {
  const log = logger.child({
    handler: "StudentRegistrationController.getById",
    params: req.params
  });
  try {
    const id = Number(req.params.id);
    const registration = await prisma.studentRegistration.findUnique({
      where: { id },
      include: {
        user: true,
        institution: true,
        phase: true,
        subgroup: true,
      },
    });

    if (!registration) {
      return sendResponse({
        res,
        status: 404,
        tag: "notFound",
        message: "Student registration not found.",
        log
      });
    }

    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: "Student registration retrieved successfully.",
      data: { registration },
      log
    });
  } catch (err) {
    log.error(err, "Unexpected error occurred while fetching student registration.");

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

// Update Student Registration
exports.update = async (req, res) => {
  const log = logger.child({
    handler: "StudentRegistrationController.update",
    params: req.params,
    body: req.body
  });
  try {
    const { user_id, institution_id, phase_id, subgroup_id, custom_data } = req.body;
    const id = Number(req.params.id);

    if (
      (user_id && typeof user_id !== "number") ||
      (institution_id && typeof institution_id !== "number") ||
      (phase_id && typeof phase_id !== "number") ||
      (subgroup_id && typeof subgroup_id !== "number") ||
      (custom_data && !isJSON(custom_data))
    ) {
      return sendResponse({
        res,
        status: 400,
        tag: "invalidParameters",
        message: "Invalid parameters.",
        log
      });
    }

    let registration = await prisma.studentRegistration.findUnique({
      where: { id }
    });

    if (!registration) {
      return sendResponse({
        res,
        status: 404,
        tag: "notFound",
        message: "Student registration not found.",
        log
      });
    }

    registration = await prisma.studentRegistration.update({
      where: { id: registration.id },
      data: {
        ...(user_id && { user_id }),
        ...(institution_id && { institution_id }),
        ...(phase_id && { phase_id }),
        ...(subgroup_id && { subgroup_id }),
        ...(custom_data && { custom_data })
      },
      include: {
        user: true,
        institution: true,
        phase: true,
        subgroup: true,
      },
    });

    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: "Student registration updated successfully.",
      data: { registration },
      log
    });
  } catch (err) {
    log.error(err, "Unexpected error occurred while updating student registration.");

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

// Delete Student Registration
exports.remove = async (req, res) => {
  const log = logger.child({
    handler: "StudentRegistrationController.remove",
    params: req.params
  });
  try {
    const id = req.params.id;

    if (typeof id !== "number") {
      return sendResponse({
        res,
        status: 400,
        tag: "invalidId",
        message: "ID must be a number.",
        log
      });
    }
    await prisma.studentRegistration.delete({
      where: { id },
    });

    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: "Student registration deleted successfully.",
      data: { id },
      log
    });
  } catch (err) {
    log.error(err, "Unexpected error occurred while deleting student registration.");

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
