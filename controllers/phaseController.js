const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create Phase
exports.create = async (req, res) => {
  try {
    const phase = await prisma.phase.create({
      data: {
        name: req.body.name,
        description: req.body.description || null
      }
    });
    res.status(201).json(phase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Phases
exports.getAll = async (req, res) => {
  try {
    const phases = await prisma.phase.findMany({
      include: { studentRegs: true }
    });
    res.json(phases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Phase by ID
exports.getById = async (req, res) => {
  try {
    const phase = await prisma.phase.findUnique({
      where: { id: Number(req.params.id) },
      include: { studentRegs: true }
    });
    if (!phase) {
      return res.status(404).json({ error: 'Phase not found' });
    }
    res.json(phase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Phase
exports.update = async (req, res) => {
  try {
    const phase = await prisma.phase.update({
      where: { id: Number(req.params.id) },
      data: {
        name: req.body.name,
        description: req.body.description || null
      }
    });
    res.json(phase);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Phase not found' });
    }
    res.status(500).json({ error: err.message });
  }
};

// Delete Phase
exports.remove = async (req, res) => {
  try {
    await prisma.phase.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ message: 'Phase deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Phase not found' });
    }
    res.status(500).json({ error: err.message });
  }
};
