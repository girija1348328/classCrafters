const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create Main Group
exports.create = async (req, res) => {
  try {
    const mainGroup = await prisma.mainGroup.create({
      data: {
        name: req.body.name,
        description: req.body.description || null
      }
    });
    res.status(201).json(mainGroup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Main Groups
exports.getAll = async (req, res) => {
  try {
    const mainGroups = await prisma.mainGroup.findMany({
      include: { subGroups: true }
    });
    res.json(mainGroups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Main Group by ID
exports.getById = async (req, res) => {
  try {
    const mainGroup = await prisma.mainGroup.findUnique({
      where: { id: Number(req.params.id) },
      include: { subGroups: true }
    });
    if (!mainGroup) {
      return res.status(404).json({ error: 'Main Group not found' });
    }
    res.json(mainGroup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Main Group
exports.update = async (req, res) => {
  try {
    const mainGroup = await prisma.mainGroup.update({
      where: { id: Number(req.params.id) },
      data: {
        name: req.body.name,
        description: req.body.description || null
      }
    });
    res.json(mainGroup);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Main Group not found' });
    }
    res.status(500).json({ error: err.message });
  }
};

// Delete Main Group
exports.remove = async (req, res) => {
  try {
    await prisma.mainGroup.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ message: 'Main Group deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Main Group not found' });
    }
    res.status(500).json({ error: err.message });
  }
};
