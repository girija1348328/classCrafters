const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create Institution
exports.create = async (req, res) => {
  try {
    const { name, education_type_id, location_id } = req.body;

    // Optional: Check foreign keys exist
    const educationTypeExists = await prisma.educationType.findUnique({
      where: { id: education_type_id }
    });
    if (!educationTypeExists) {
      return res.status(400).json({ error: "Invalid education_type_id" });
    }

    const locationExists = await prisma.location.findUnique({
      where: { id: location_id }
    });
    if (!locationExists) {
      return res.status(400).json({ error: "Invalid location_id" });
    }

    const institution = await prisma.institution.create({
      data: {
        name,
        education_type_id,
        location_id
      },
      include: {
        educationType: true,
        location: true
      }
    });

    res.status(201).json(institution);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Institutions
exports.getAll = async (req, res) => {
  try {
    const institutions = await prisma.institution.findMany({
      include: {
        educationType: true,
        location: true
      }
    });
    res.json(institutions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Institution by ID
exports.getById = async (req, res) => {
  try {
    const institution = await prisma.institution.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        educationType: true,
        location: true
      }
    });
    if (!institution) {
      return res.status(404).json({ error: 'Institution not found' });
    }
    res.json(institution);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Institution
exports.update = async (req, res) => {
  try {
    const { name, education_type_id, location_id } = req.body;

    if (education_type_id) {
      const educationTypeExists = await prisma.educationType.findUnique({
        where: { id: education_type_id }
      });
      if (!educationTypeExists) {
        return res.status(400).json({ error: "Invalid education_type_id" });
      }
    }

    if (location_id) {
      const locationExists = await prisma.location.findUnique({
        where: { id: location_id }
      });
      if (!locationExists) {
        return res.status(400).json({ error: "Invalid location_id" });
      }
    }

    const institution = await prisma.institution.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        education_type_id,
        location_id
      },
      include: {
        educationType: true,
        location: true
      }
    });

    res.json(institution);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: 'Institution not found' });
    }
    res.status(500).json({ error: err.message });
  }
};

// Delete Institution
exports.remove = async (req, res) => {
  try {
    await prisma.institution.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ message: 'Institution deleted successfully' });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: 'Institution not found' });
    }
    res.status(500).json({ error: err.message });
  }
};
