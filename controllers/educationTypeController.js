const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create an Education Type
exports.create = async (req, res) => {
  try {
    const educationType = await prisma.educationType.create({
      data: {
        name: req.body.name
      }
    });
    res.status(201).json(educationType);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Education Types
exports.getAll = async (req, res) => {
  try {
    const educationTypes = await prisma.educationType.findMany({
      include: { institutions: true }
    });
    res.json(educationTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Education Type by ID
exports.getById = async (req, res) => {
  try {
    const educationType = await prisma.educationType.findUnique({
      where: { id: Number(req.params.id) },
      include: { institutions: true }
    });
    if (!educationType) return res.status(404).json({ error: 'Education type not found' });
    res.json(educationType);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Education Type
exports.update = async (req, res) => {
  try {
    const educationType = await prisma.educationType.update({
      where: { id: Number(req.params.id) },
      data: {
        name: req.body.name
      }
    });
    res.json(educationType);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Education type not found' });
    }
    res.status(500).json({ error: err.message });
  }
};

// Delete Education Type
exports.remove = async (req, res) => {
  try {
    await prisma.educationType.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ message: 'Education type deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Education type not found' });
    }
    res.status(500).json({ error: err.message });
  }
};
