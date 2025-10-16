const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create assignment
const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, classroomId, createdBy } = req.body;

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        classroomId: parseInt(classroomId),
        createdBy
      },
      include: {
        classroom: true,
        submissions: true
      }
    });

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all assignments for a classroom
const getClassroomAssignments = async (req, res) => {
  try {
    const { classroomId } = req.params;

    const assignments = await prisma.assignment.findMany({
      where: { classroomId: parseInt(classroomId) },
      include: {
        submissions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get assignment by ID
const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(id) },
      include: {
        classroom: true,
        submissions: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ assignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update assignment
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;

    const assignment = await prisma.assignment.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined
      },
      include: {
        classroom: true
      }
    });

    res.json({
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete assignment
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.assignment.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createAssignment,
  getClassroomAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment
};