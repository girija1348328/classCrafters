const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create Custom Field
exports.create = async (req, res) => {
  try {
    const { name, entity_type, field_type, options } = req.body;

    const customField = await prisma.customField.create({
      data: {
        name,
        entity_type, // "student_registration" or "staff_registration"
        field_type,  // text, number, date, dropdown
        options: options || null
      }
    });

    res.status(201).json(customField);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Custom Fields
exports.getAll = async (req, res) => {
  try {
    const customFields = await prisma.customField.findMany();
    res.json(customFields);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Custom Field by ID
exports.getById = async (req, res) => {
  try {
    const customField = await prisma.customField.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!customField) {
      return res.status(404).json({ error: 'Custom Field not found' });
    }

    res.json(customField);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Custom Field
exports.update = async (req, res) => {
  try {
    const { name, entity_type, field_type, options } = req.body;

    const customField = await prisma.customField.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        entity_type,
        field_type,
        options: options || null
      }
    });

    res.json(customField);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Custom Field not found' });
    }
    res.status(500).json({ error: err.message });
  }
};

// Delete Custom Field
exports.remove = async (req, res) => {
  try {
    await prisma.customField.delete({
      where: { id: Number(req.params.id) }
    });

    res.json({ message: 'Custom Field deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Custom Field not found' });
    }
    res.status(500).json({ error: err.message });
  }
};
