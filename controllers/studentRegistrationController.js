const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
      message: "Student registration successfully.",
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
  try {
    const registrations = await prisma.studentRegistration.findMany({
      include: {
        user: true,
        institution: true,
        phase: true,
        subgroup: true,
      },
    });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Student Registration by ID
exports.getById = async (req, res) => {
  try {
    const registration = await prisma.studentRegistration.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: true,
        institution: true,
        phase: true,
        subgroup: true,
      },
    });

    if (!registration) {
      return res.status(404).json({ error: "Student Registration not found" });
    }

    res.json(registration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Student Registration
exports.update = async (req, res) => {
  try {
    const { user_id, institution_id, phase_id, subgroup_id, custom_data } =
      req.body;

    const registration = await prisma.studentRegistration.update({
      where: { id: Number(req.params.id) },
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

    res.json(registration);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Student Registration not found" });
    }
    res.status(500).json({ error: err.message });
  }
};

// Delete Student Registration
exports.remove = async (req, res) => {
  try {
    await prisma.studentRegistration.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({ message: "Student Registration deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Student Registration not found" });
    }
    res.status(500).json({ error: err.message });
  }
};
