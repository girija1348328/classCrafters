const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a Location
exports.create = async (req, res) => {
  try {
    const location = await prisma.location.create({
      data: {
        name: req.body.name,
        address: req.body.address || null,
        city: req.body.city || null,
        state: req.body.state || null,
        country: req.body.country || null,
        zipcode: req.body.zipcode || null
      }
    });
    res.status(201).json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all Locations
exports.getAll = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      include: { institutions: true }
    });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Location by ID
exports.getById = async (req, res) => {
  try {
    const location = await prisma.location.findUnique({
      where: { id: Number(req.params.id) },
      include: { institutions: true }
    });
    if (!location) return res.status(404).json({ error: 'Location not found' });
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Location
exports.update = async (req, res) => {
  try {
    const location = await prisma.location.update({
      where: { id: Number(req.params.id) },
      data: {
        name: req.body.name,
        address: req.body.address || null,
        city: req.body.city || null,
        state: req.body.state || null,
        country: req.body.country || null,
        zipcode: req.body.zipcode || null
      }
    });
    res.json(location);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.status(500).json({ error: err.message });
  }
};

// Delete Location
exports.remove = async (req, res) => {
  try {
    await prisma.location.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ message: 'Location deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.status(500).json({ error: err.message });
  }
};
