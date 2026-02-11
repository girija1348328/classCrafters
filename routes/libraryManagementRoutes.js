const express = require("express");
const router = express.Router();
const { createBook, getBooks, deleteBook, issueBook, returnBook, getOverdueBooks } = require("../controllers/libraryManagementController");
const verifyToken = require("../middlewares/authMiddleWare");

router.use(verifyToken); // Protect all routes


router.post("/books", createBook);
router.get("/books", getBooks);
router.delete("/books/:id", deleteBook);
router.post("/books/issue", issueBook);
router.post("/books/return", returnBook);
router.get("/books/overdue", getOverdueBooks);

module.exports = router;