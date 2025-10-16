const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Submit assignment
const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, studentId, fileUrl } = req.body;

    // Check if assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(assignmentId) }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id: parseInt(studentId) }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if already submitted
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId: parseInt(assignmentId),
        studentId: parseInt(studentId)
      }
    });

    if (existingSubmission) {
      return res.status(400).json({ error: 'Assignment already submitted' });
    }

    const submission = await prisma.submission.create({
      data: {
        assignmentId: parseInt(assignmentId),
        studentId: parseInt(studentId),
        fileUrl
      },
      include: {
        assignment: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get submissions for an assignment
const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submissions = await prisma.submission.findMany({
      where: { assignmentId: parseInt(assignmentId) },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Grade submission
const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { grade } = req.body;

    const submission = await prisma.submission.update({
      where: { id: parseInt(id) },
      data: { grade },
      include: {
        assignment: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Submission graded successfully',
      submission
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get student's submissions
const getStudentSubmissions = async (req, res) => {
  try {
    const { studentId } = req.params;

    const submissions = await prisma.submission.findMany({
      where: { studentId: parseInt(studentId) },
      include: {
        assignment: {
          include: {
            classroom: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  submitAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
  getStudentSubmissions
};