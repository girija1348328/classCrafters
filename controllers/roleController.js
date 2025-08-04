const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a Role
exports.create = async (req, res) => {
  try {
    const role = await prisma.role.create({
      data: {
        name: req.body.name,
        description: req.body.description || null
      }
    });
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
