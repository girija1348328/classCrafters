const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/* =========================
   CREATE BOOK
========================= */
exports.createBook = async (req, res) => {
  try {
    const { title, author, category, totalCopies } = req.body;

    const book = await prisma.book.create({
      data: {
        title,
        author,
        category,
        totalCopies: Number(totalCopies),
        available: Number(totalCopies)
      }
    });

    res.status(201).json({ success: true, book });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =========================
   GET ALL BOOKS
========================= */
exports.getBooks = async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: "desc" }
    });

    res.json({ success: true, books });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =========================
   DELETE BOOK
========================= */
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.book.delete({
      where: { id: Number(id) }
    });

    res.json({ success: true, message: "Book deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.issueBook = async (req, res) => {
  try {
    const { studentId, bookId, dueDate } = req.body;

    const book = await prisma.book.findUnique({
      where: { id: Number(bookId) }
    });

    if (!book || book.available <= 0) {
      return res.status(400).json({
        success: false,
        message: "Book not available"
      });
    }

    const issue = await prisma.bookIssue.create({
      data: {
        student: {
          connect: { id: Number(studentId) }
        },
        book: {
          connect: { id: Number(bookId) }
        },
        issueDate: new Date(),
        dueDate: new Date(dueDate)
      }
    });

    await prisma.book.update({
      where: { id: Number(bookId) },
      data: {
        available: book.available - 1
      }
    });

    res.status(201).json({ success: true, issue });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const { issueId } = req.body;

    const issue = await prisma.bookIssue.findUnique({
      where: { id: Number(issueId) },
      include: { book: true }
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue record not found"
      });
    }

    if (issue.returnDate) {
      return res.status(400).json({
        success: false,
        message: "Book already returned"
      });
    }

    const today = new Date();
    const due = new Date(issue.dueDate);

    let fine = 0;
    if (today > due) {
      const diffDays = Math.ceil(
        (today - due) / (1000 * 60 * 60 * 24)
      );
      fine = diffDays * 10; // ₹10 per day fine
    }

    const updatedIssue = await prisma.bookIssue.update({
      where: { id: Number(issueId) },
      data: {
        returnDate: today,
        fine
      }
    });

    await prisma.book.update({
      where: { id: issue.bookId },
      data: {
        available: issue.book.available + 1
      }
    });

    res.json({ success: true, updatedIssue });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOverdueBooks = async (req, res) => {
  try {
    const today = new Date();

    const overdue = await prisma.bookIssue.findMany({
      where: {
        dueDate: { lt: today },
        returnDate: null
      },
      include: {
        student: true,
        book: true
      }
    });

    res.json({ success: true, overdue });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

