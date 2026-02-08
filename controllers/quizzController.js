import { PrismaClient,AttemptStatus } from "@prisma/client";

const prisma = new PrismaClient();

/* ======================================================
   ADMIN: CREATE QUIZ
====================================================== */
export const createQuiz = async (req, res) => {
  try {
    const { title, description, durationSeconds, totalMarks } = req.body;
    const { classroomId } = req.params;
    const adminId = req.user.id;



    // ✅ FIXED: use teacherId instead of createdById
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: Number(classroomId),
        teacherId: adminId,
      },
    });

    if (!classroom) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create quiz for this classroom",
      });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        durationSeconds,
        totalMarks,
        createdById: adminId,
        classroomId: Number(classroomId),
      },
    });

    res.status(201).json({ success: true, quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};




/* ======================================================
   ADMIN: ADD QUESTION + OPTIONS
====================================================== */
export const addQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { questionText, marks, options, correctOptionIndex } = req.body;

    const question = await prisma.question.create({
      data: {
        quizId: Number(quizId),
        questionText,
        marks,
        options: {
          create: options.map((opt, index) => ({
            optionText: opt,
            isCorrect: index === correctOptionIndex,
          })),
        },
      },
    });

    res.status(201).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


/* ======================================================
   ADMIN: PUBLISH QUIZ
====================================================== */
export const publishQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await prisma.quiz.update({
      where: { id: Number(quizId) },
      data: { isPublished: true },
    });

    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


/* ======================================================
   STUDENT: GET QUIZ (NO CORRECT ANSWERS)
====================================================== */
export const getQuizForStudent = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await prisma.quiz.findFirst({
      where: {
        id: Number(quizId),
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        durationSeconds: true,
        questions: {
          select: {
            id: true,
            questionText: true,
            options: {
              select: {
                id: true,
                optionText: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



/* ======================================================
   STUDENT: START QUIZ
====================================================== */
export const startQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.user.id;

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: Number(quizId),
        studentId,
        startTime: new Date(),
        status: AttemptStatus.IN_PROGRESS,
      },
    });

    res.status(201).json({ success: true, attemptId: attempt.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



/* ======================================================
   STUDENT: SUBMIT QUIZ
====================================================== */
export const submitQuiz = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body; 

    console.log("Submitting Quiz - Attempt ID:", attemptId);
    console.log("Answers Received:", answers);
    // answers = [{ questionId, selectedOptionId }]

    let score = 0;

    await prisma.$transaction(async (tx) => {
      for (const ans of answers) {
        const option = await tx.option.findUnique({
          where: { id: ans.selectedOptionId },
        });

        const isCorrect = option?.isCorrect || false;
        if (isCorrect) score++;

        await tx.quizAnswer.create({
          data: {
            attemptId: Number(attemptId),
            questionId: ans.questionId,
            selectedOptionId: ans.selectedOptionId,
            isCorrect,
          },
        });
      }

      const totalQuestions = answers.length;
      const percentage = (score / totalQuestions) * 100;

      await tx.quizAttempt.update({
        where: { id: Number(attemptId) },
        data: {
          score,
          percentage,
          endTime: new Date(),
          status: AttemptStatus.SUBMITTED,
        },
      });
    });

    res.json({
      success: true,
      score,
      total: answers.length,
      percentage: Math.round((score / answers.length) * 100),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


/* ======================================================
   CLASSROOM: GET QUIZZES (TEACHER / STUDENT)
====================================================== */
export const getClassroomQuizzes = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role; // "TEACHER" | "STUDENT"

    // 1️⃣ Verify classroom exists
    const classroom = await prisma.classroom.findUnique({
      where: { id: Number(classroomId) },
    });

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: "Classroom not found",
      });
    }

    // 2️⃣ Authorization check
    if (userRole === "TEACHER" && classroom.teacherId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view quizzes of this classroom",
      });
    }

    // 3️⃣ Query condition
    const whereCondition = {
      classroomId: Number(classroomId),
      ...(userRole === "STUDENT" && { isPublished: true }),
    };

    const quizzes = await prisma.quiz.findMany({
      where: whereCondition,
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        durationSeconds: true,
        totalMarks: true,
        isPublished: true,
        created_at: true,
      },
    });

    res.json({ success: true, quizzes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};
