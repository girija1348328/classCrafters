const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.create = async (req, res) => {
  try {
    const data = await prisma.user.create({ data: req.body });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await prisma.user.findMany({ include: { role: true } });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      include: { role: true }
    });
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
