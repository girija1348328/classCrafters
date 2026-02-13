const { PrismaClient,AlumniType  } = require("@prisma/client");
const prisma = new PrismaClient();

/* ======================================================
   ADMIN: CREATE ALUMNI
====================================================== */
exports.createAlumni = async (req, res) => {
  try {
    const {
      studentId,
      staffId,
      institutionId,
      alumniType,
      passOutYear,
      lastClass,
      currentStatus,
      currentOrg
    } = req.body;

    const formattedAlumniType = alumniType?.toUpperCase();

    if (!AlumniType[formattedAlumniType]) {
      return res.status(400).json({
        success: false,
        message: `Invalid alumniType. Allowed values: ${Object.keys(AlumniType).join(", ")}`
      });
    }

    const alumni = await prisma.alumni.create({
      data: {
        student: studentId
          ? { connect: { id: Number(studentId) } }
          : undefined,

        staff: staffId
          ? { connect: { id: Number(staffId) } }
          : undefined,

        institution: {
          connect: { id: Number(institutionId) }
        },

        alumniType: AlumniType[formattedAlumniType],
        passOutYear,
        lastClass,
        currentStatus,
        currentOrg
      }
    });

    res.status(201).json({ success: true, alumni });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};




/* ======================================================
   ADMIN: GET ALL ALUMNIS
====================================================== */
exports.getAllAlumnis = async (req, res) => {
  try {
    const alumnis = await prisma.alumni.findMany({
      orderBy: { createdAt: "desc" },
    });
    console.log("Alumnis fetched:", alumnis);

    res.json({ success: true, data: alumnis });
  } catch (error) {
    console.error("GET ALL ALUMNIS ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ======================================================
   ADMIN: GET SINGLE ALUMNI
====================================================== */
exports.getAlumniById = async (req, res) => {
  try {
    const { id } = req.params;
    const alumni = await prisma.alumni.findUnique({
      where: { id: Number(id) },
    }); 
    if (!alumni) {
        return res.status(404).json({ success: false, message: "Alumni not found" });
    }
    res.json({ success: true, data: alumni });
  } catch (error) {
    console.error("GET SINGLE ALUMNI ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ======================================================
   ADMIN: UPDATE ALUMNI
====================================================== */
exports.updateAlumni = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, staffId, institutionId, alumniType, passOutYear, lastClass, currentStatus, currentOrg } = req.body;
    const alumni = await prisma.alumni.update({
      where: { id: Number(id) },
      data: {
        studentId,
        staffId,
        institutionId,
        alumniType,
        passOutYear,
        lastClass,
        currentStatus,
        currentOrg
      }
    });
    res.json({ success: true, data: alumni });
  } catch (error) {
    console.error("UPDATE ALUMNI ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* ======================================================
   ADMIN: DELETE ALUMNI
====================================================== */
exports.deleteAlumni = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.alumni.delete({
      where: { id: Number(id) }
    });
    res.json({ success: true, message: "Alumni deleted successfully" });
  } catch (error) {
    console.error("DELETE ALUMNI ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


    