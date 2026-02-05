const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const logger = require("../config/logger");
const { sendResponse } = require("../utils/responseLogger.js");
const { isJSON } = require("../utils/helper");

// Create Student Registration
exports.create = async (req, res) => {
  const log = logger.child({
    handler: "StudentRegistrationController.create"
  });

  try {
    const { student, parent, registration, documents } = req.body;

    // =========================
    // 1️⃣ BASIC VALIDATION
    // =========================
    if (!student || !registration) {
      return sendResponse({
        res,
        status: 400,
        tag: "missingField",
        message: "Student and Registration data are required.",
        log
      });
    }

    const {
      academic_sessionId,
      classroom_id,
      section_id,
      user_id,
      institution_id,
      phase_id,
      subgroup_id,
      rollNumber,
      status,
      custom_data
    } = registration;

    if (
      !academic_sessionId ||
      !classroom_id ||
      !section_id ||
      !user_id ||
      !institution_id ||
      !phase_id ||
      !subgroup_id ||
      !status
    ) {
      return sendResponse({
        res,
        status: 400,
        tag: "missingField",
        message:
          "Academic session, class, section, user, institution, phase, subgroup and status are required.",
        log
      });
    }

    // =========================
    // 🔢 PARSE IDs (CRITICAL)
    // =========================
    const academicSessionId = parseInt(academic_sessionId);
    const classroomId = parseInt(classroom_id);
    const sectionId = parseInt(section_id);
    const rollNum = parseInt(rollNumber);
    const userId = parseInt(user_id);
    const institutionId = parseInt(institution_id);
    const phaseId = parseInt(phase_id);
    const subgroupId = parseInt(subgroup_id);

    // Validate parsed IDs
    if (
      [
        academicSessionId,
        classroomId,
        sectionId,
        rollNum,
        userId,
        institutionId,
        phaseId,
        subgroupId
      ].some(Number.isNaN)
    ) {
      return sendResponse({
        res,
        status: 400,
        tag: "invalidId",
        message: "All IDs must be valid numbers.",
        log
      });
    }


    // =========================
    // 2️⃣ FOREIGN KEY CHECKS
    // =========================
    const [
      userExists,
      institutionExists,
      phaseExists,
      subgroupExists
    ] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.institution.findUnique({ where: { id: institutionId } }),
      prisma.phase.findUnique({ where: { id: phaseId } }),
      prisma.subGroup.findUnique({ where: { id: subgroupId } })
    ]);

    if (!userExists)
      return sendResponse({ res, status: 404, tag: "userNotFound", message: "User not found", log });

    if (!institutionExists)
      return sendResponse({ res, status: 404, tag: "institutionNotFound", message: "Institution not found", log });

    if (!phaseExists)
      return sendResponse({ res, status: 404, tag: "phaseNotFound", message: "Phase not found", log });

    if (!subgroupExists)
      return sendResponse({ res, status: 404, tag: "subgroupNotFound", message: "Subgroup not found", log });


    const admissionNo = parseInt(student.admissionNo);

    // Validate admissionNo
    if (Number.isNaN(admissionNo)) {
      return sendResponse({
        res,
        status: 400,
        tag: "invalidAdmissionNo",
        message: "Admission number must be a valid number.",
        log
      });
    }
    // =========================
    // 3️⃣ TRANSACTION (CORE)
    // =========================
    const result = await prisma.$transaction(async (tx) => {

      // ➤ Create Student
      const newStudent = await tx.student.create({
        data: {
          ...student,
          admissionNo,          // 👈 parsed Int
          dob: new Date(student.dob)
        }
      });

      // ➤ Create Parent (optional)
      if (parent) {
        await tx.Parent.create({
          data: {
            ...parent,
            studentId: newStudent.id
          }
        });
      }

      // ➤ Create Student Registration
      const newRegistration = await tx.studentRegistration.create({
        data: {
          student_id: newStudent.id,
          academic_sessionId: academicSessionId,
          classroom_id: classroomId,
          section_id: sectionId,
          rollNumber: rollNum,
          user_id: userId,
          institution_id: institutionId,
          phase_id: phaseId,
          subgroup_id: subgroupId,
          status,
          custom_data: custom_data ?? null
        }
      });


      // ➤ Create Documents (optional)
      if (documents?.length) {
        await tx.studentDocument.createMany({
          data: documents.map(doc => ({
            ...doc,
            studentId: newStudent.id
          }))
        });
      }

      return {
        student: newStudent,
        registration: newRegistration
      };
    });

    // =========================
    // 4️⃣ SUCCESS RESPONSE
    // =========================
    return sendResponse({
      res,
      status: 201,
      tag: "success",
      message: "Student registered successfully.",
      data: result,
      log
    });

  } catch (err) {
    log.error(err, "Student registration failed");

    // Prisma known errors
    if (err.code === "P2002") {
      return sendResponse({
        res,
        status: 409,
        tag: "duplicateEntry",
        message: "Duplicate entry detected.",
        log
      });
    }

    return sendResponse({
      res,
      status: 500,
      tag: "serverError",
      message: "Internal server error",
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
        student: true,
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
    params: req.params,
  });

  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return sendResponse({
        res,
        status: 400,
        tag: "invalidId",
        message: "Invalid registration ID.",
        log,
      });
    }

    const registration = await prisma.studentRegistration.findUnique({
      where: { id },
      include: {
        // 👇 Student core details
        student: {
          include: {
            parent: true,
            documents: true,
          },
        },

        // 👇 Academic / system relations
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
        log,
      });
    }

    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: "Student registration retrieved successfully.",
      data: { registration },
      log,
    });
  } catch (err) {
    log.error(
      err,
      "Unexpected error occurred while fetching student registration."
    );

    if (err.code === "P1001") {
      return sendResponse({
        res,
        status: 503,
        tag: "databaseUnavailable",
        message: "Database connection failed. Please try again later.",
        log,
      });
    }

    return sendResponse({
      res,
      status: 500,
      tag: "serverError",
      message: "An internal server error occurred.",
      log,
    });
  }
};



exports.filterStudents = async (req, res) => {
  const log = logger.child({
    handler: "StudentRegistrationController.filter",
  });

  try {
    const {
      institution_id,
      classroom_id,
      section_id,
      status,
      page = 1,
      limit = 20,
    } = req.query;

    // =========================
    // 🔢 PARSE & VALIDATE QUERY
    // =========================
    const institutionId = institution_id ? parseInt(institution_id) : undefined;
    const classroomId = classroom_id ? parseInt(classroom_id) : undefined;
    const sectionId = section_id ? parseInt(section_id) : undefined;

    if (
      [institutionId, classroomId, sectionId].some(
        (v) => v !== undefined && Number.isNaN(v)
      )
    ) {
      return sendResponse({
        res,
        status: 400,
        tag: "invalidQuery",
        message: "institution_id, classroom_id and section_id must be numbers",
        log,
      });
    }

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    // =========================
    // 🧠 BUILD FILTER OBJECT
    // =========================
    const registrationWhere = {};

    if (institutionId) registrationWhere.institution_id = institutionId;
    if (classroomId) registrationWhere.classroom_id = classroomId;
    if (sectionId) registrationWhere.section_id = sectionId;
    if (status) registrationWhere.status = status;

    // =========================
    // 🔍 QUERY DATABASE
    // =========================
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where: {
          admissions: {
            some: registrationWhere,
          },
        },
        include: {
          admissions: {
            where: registrationWhere,
            include: {
              institution: true,
              phase: true,
              subgroup: true,
              user: true,
            },
          },
          parent: true,
          documents: true,
        },
        orderBy: {
          created_at: "desc",
        },
        skip,
        take,
      }),

      prisma.student.count({
        where: {
          admissions: {
            some: registrationWhere,
          },
        },
      }),
    ]);

    // =========================
    // ✅ SUCCESS RESPONSE
    // =========================
    return sendResponse({
      res,
      status: 200,
      tag: "success",
      message: "Students fetched successfully",
      data: {
        students,
        pagination: {
          total,
          page: Number(page),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
      log,
    });
  } catch (err) {
    log.error(err, "Failed to fetch students with filters");

    return sendResponse({
      res,
      status: 500,
      tag: "serverError",
      message: "Internal server error",
      log,
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
