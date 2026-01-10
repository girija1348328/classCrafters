const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyToken = require("../middlewares/authMiddleWare");
const upload = multer({ storage: multer.memoryStorage() });
const {
    createRoom,
    sendMessage,
    fetchChatList,
    fetchMessages,
    getOrCreateDirectChat
} = require("../controllers/chatController");

router.post("/getOrCreateDirectChat", verifyToken, getOrCreateDirectChat);
router.post("/createRoom", verifyToken, createRoom);
router.post("/sendMessage", verifyToken, upload.single("file"), sendMessage);
router.get("/fetchChatList", verifyToken, fetchChatList);
router.get("/fetchMessages", verifyToken, fetchMessages);

module.exports = router;