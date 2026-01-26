const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

let io = null;

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.headers?.token;
      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("🟢 Socket connected:", socket.id, "user:", socket.userId);

    // Automatically join all rooms
    const rooms = await prisma.chatParticipant.findMany({
      where: { userId: socket.userId },
      select: { chatRoomId: true }
    });
    rooms.forEach(r => socket.join(`chat-${r.chatRoomId}`));

    socket.on("join-rooms", (roomIds) => {
      if (!Array.isArray(roomIds)) return;
      roomIds.forEach(id => socket.join(`chat-${id}`));
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected", socket.id);
    });
  });
}

function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

module.exports = { initSocket, getIO };
