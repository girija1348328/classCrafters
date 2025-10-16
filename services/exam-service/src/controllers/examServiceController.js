// exam-service/controllers/examController.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Creates a new exam.
 */
exports.createExam = async (req, res) => {
    try {
        const { title, description, questions } = req.body;

        console.log(`[ExamService] Creating exam titled: "${title}"`);

        if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ error: "Exam title, description, and at least one question are required." });
        }

        // Generate a unique ID for each question
        const questionsWithIds = questions.map((question, index) => {
            return {
                ...question,
                id: index + 1 // Simple, sequential ID. Can be replaced with a more robust UUID generator.
            };
        });

        const newExam = await prisma.Exam.create({
            data: {
                title,
                description,
                questions: questionsWithIds
            },
        });

        console.log(`[ExamService] New exam created with ID: ${newExam.id}`);
        res.status(201).json(newExam);
    } catch (error) {
        console.error('[ExamService] Error creating exam:', error.message);
        res.status(500).json({ error: "Failed to create exam." });
    }
};

/**
 * Retrieves a list of available exams for a given student.
 */
exports.getExamsForStudent = async (req, res) => {
    try {
        const studentId = req.user.id;
        console.log(`[ExamService] Fetching exams for student ID: ${studentId}`);
        const exams = await prisma.Exam.findMany({
            where: {
                id: { gt: 0 } // Placeholder logic
            },
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
            }
        });

        console.log(`[ExamService] Found ${exams.length} exams for student ID: ${studentId}`);
        res.status(200).json(exams);
    } catch (error) {
        console.error('[ExamService] Error getting exams:', error.message);
        res.status(500).json({ error: "Failed to retrieve exams." });
    }
};

/**
 * Submits a student's answers for an exam.
 */
exports.submitExam = async (req, res) => {
    try {
        const { examId, answers } = req.body;
        const studentId = req.user.id;

        // Check if the student has already submitted this exam
        const existingSubmission = await prisma.ExamSubmission.findUnique({
            where: {
                studentId_examId: {
                    studentId: studentId,
                    examId: examId,
                },
            },
        });

        if (existingSubmission) {
            console.warn(`[ExamService] Duplicate submission attempt by student ${studentId} for exam ${examId}.`);
            return res.status(409).json({ error: "This student has already submitted this exam." });
        }

        const submission = await prisma.ExamSubmission.create({
            data: {
                studentId: studentId,
                examId: examId,
                answers: answers,
            },
        });

        console.log(`[ExamService] Submission successful: Student ${studentId} for Exam ${examId}.`);
        res.status(201).json(submission);
    } catch (error) {
        console.error(`[ExamService] Database Error during submission: ${error.message}`);
        res.status(500).json({ error: "Failed to save exam submission." });
    }
};