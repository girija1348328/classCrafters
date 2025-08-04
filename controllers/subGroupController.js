const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create SubGroup
exports.create = async (req, res) => {
  try {
    const subGroup = await prisma.subGroup.create({
      data: {
        name: req.body.name,
        main_group_id: req.body.main_group_id
      }
    });
    res.status(201).json(subGroup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All SubGroups
exports.getAll = async (req, res) => {
  try {
    const subGroups = await prisma.subGroup.findMany({
      include: { mainGroup: true, studentRegs: true }
    });
    res.json(subGroups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get SubGroup by ID
exports.getById = async (req, res) => {
  try {
    const subGroup = await prisma.subGroup.findUnique({
      where: { id: Number(req.params.id) },
      include: { mainGroup: true, studentRegs: true }
    });
    if (!subGroup) {
      return res.status(404).json({ error: 'SubGroup not found' });
    }
    res.json(subGroup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update SubGroup
exports.update = async (req, res) => {
  try {
    const subGroup = await prisma.subGroup.update({
      where: { id: Number(req.params.id) },
      data: {
        name: req.body.name,
        main_group_id: req.body.main_group_id
      }
    });
    res.json(subGroup);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'SubGroup not found' });
    }
    res.status(500).json({ error: err.message });
  }
};

// Delete SubGroup
exports.remove = async (req, res) => {
  try {
    await prisma.subGroup.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ message: 'SubGroup deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'SubGroup not found' });
    }
    res.status(500).json({ error: err.message });
  }
};
