const { PrismaClient, ChatRoomType } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require("../config/logger");
const { sendResponse } = require("../utils/responseLogger.js");
const { getIO } = require("../sockets/chat.socket");

exports.getOrCreateDirectChat = async (req, res) => {
    const log = logger.child({
        handler: "ChatController.getOrCreateDirectChat",
        body: req.body
    });

    try {
        const { receiverId } = req.body;
        const senderId = req.user.id;

        if (!receiverId) {
            return sendResponse({
                res,
                status: 400,
                tag: "missingField",
                message: "receiverId is required",
                log
            });
        }

        // 🔍 Check if DIRECT chat already exists
        const existingRoom = await prisma.chatRoom.findFirst({
            where: {
                type: "DIRECT",
                participants: {
                    every: {
                        userId: { in: [senderId, receiverId] }
                    }
                }
            },
            include: { participants: true }
        });

        if (existingRoom) {
            return sendResponse({
                res,
                status: 200,
                tag: "success",
                message: "Chat room fetched successfully",
                data: {
                    room: existingRoom
                },
                log
            });
        }

        // 🆕 Create new DIRECT chat room
        const room = await prisma.chatRoom.create({
            data: {
                type: "DIRECT",
                createdBy: senderId,
                updatedBy: senderId,
                participants: {
                    createMany: {
                        data: [
                            { userId: senderId },
                            { userId: receiverId }
                        ]
                    }
                }
            },
            include: {
                participants: true
            }
        });

        return sendResponse({
            res,
            status: 201,
            tag: "success",
            message: "Chat room created successfully",
            data: {
                room
            },
            log
        });

    } catch (err) {
        log.error(err, "Failed to create/get direct chat");
        return sendResponse({
            res,
            status: 500,
            tag: "serverError",
            message: "Internal server error",
            log
        });
    }
};

exports.createRoom = async (req, res) => {
    const log = logger.child({
        handler: "ChatController.createRoom",
        body: req.body
    });
    try {
        const { type, name, participant_Ids } = req.body;
        const { id } = req.user;

        if (!Object.values(ChatRoomType).includes(type) || (type === "GROUP" && !name) || participant_Ids.length <= 0) {
            return sendResponse({
                res,
                status: 400,
                tag: "invalidParameters",
                message: `Invalid parameters`,
                log
            });
        }

        const participants = Array.from(
            new Set([...participant_Ids, id])
        );

        const room = await prisma.chatRoom.create({
            data: {
                type,
                ...(name && { name }),
                createdBy: id,
                updatedBy: id,
                participants: {
                    createMany: {
                        data: participants.map(userId => ({ userId }))
                    }
                }
            },
            include: {
                participants: true
            }
        })

        return sendResponse({
            res,
            status: 201,
            tag: "success",
            message: "Chat room created successfully.",
            data: {
                room
            },
            log
        });

    } catch (ex) {
        log.error(err, "Failed to create chat room");
        return sendResponse({
            res,
            status: 500,
            tag: "serverError",
            message: "Internal server error",
            log
        });
    }
};

exports.sendMessage = async (req, res) => {
    const log = logger.child({
        handler: "ChatController.sendMessage",
        body: req.body,
        file: req.file
            ? {
                name: req.file.originalname,
                type: req.file.mimetype,
                size: req.file.size
            }
            : null
    });
    try {
        const { content } = req.body;
        let { chatRoomId } = req.body;
        const senderId = req.user.id;
        chatRoomId = Number(chatRoomId);

        if (!chatRoomId || isNaN(chatRoomId)) {
            return sendResponse({
                res,
                status: 400,
                tag: "invalidParameters",
                message: "chatRoomId must be a valid number.",
                log
            });
        }

        if (!content && !req.file) {
            return sendResponse({
                res,
                status: 400,
                tag: "invalidMessage",
                message: "Either content or file must be provided.",
                log,
            });
        }

        // 🔒 Check user is participant
        const participant = await prisma.chatParticipant.findFirst({
            where: { chatRoomId, userId: senderId }
        });

        if (!participant) {
            return sendResponse({
                res,
                status: 403,
                tag: "forbidden",
                message: "You are not a participant of this chat",
                log
            });
        }

        let fileId = null;
        if (req.file) {
            const file = await prisma.file.create({
                data: {
                    name: req.file.originalname,
                    type: req.file.mimetype,
                    size: req.file.size,
                    data: req.file.buffer // store binary
                }
            });
            fileId = file.id;
        }

        const message = await prisma.chatMessage.create({
            data: {
                chatRoomId,
                senderId,
                ...(content && { content }),
                messageType: req.file ? "FILE" : "TEXT",
                fileId
            },
            // include: { file: true }
        });

        const io = getIO();
        io.to(`chat-${chatRoomId}`).emit("new-message", {
            id: message.id,
            senderId,
            chatRoomId,
            content: message.content,
            fileId: message.fileId,
            messageType: message.messageType,
            createdAt: message.createdAt
        });

        return sendResponse({
            res,
            status: 201,
            tag: "success",
            message: "Message sent",
            data: {
                message
            },
            log
        });

    } catch (err) {
        log.error(err, "Failed to send message.");
        return sendResponse({
            res,
            status: 500,
            tag: "serverError",
            message: "Internal server error",
            log
        });
    }
};

exports.fetchChatList = async (req, res) => {
    const log = logger.child({
        handler: "ChatController.fetchChatList",
        query: req.query,
        user: req.user?.id
    });
    try {
        const userId = req.user.id;

        const rooms = await prisma.chatParticipant.findMany({
            where: { userId },
            include: {
                chatRoom: {
                    include: {
                        participants: {
                            include: { user: true }
                        },
                        messages: {
                            orderBy: { createdAt: "desc" },
                            take: 1
                        }
                    }
                }
            }
        });


        return sendResponse({
            res,
            status: 200,
            tag: "success",
            message: "Chat list retrieved successfully.",
            data: { rooms },
            // meta,
            log
        });
    } catch (err) {
        log.error(err, "Unexpected error occurred while fetching chat list.");

        if (err.code === "P1001") {
            return sendResponse({
                res,
                status: 503,
                tag: "databaseUnavailable",
                message: "Database connection failed. Please try again later.",
                log
            });
        }

        return sendResponse({
            res,
            status: 500,
            tag: "serverError",
            message: "An internal server error occurred.",
            log
        });
    }
}

exports.fetchMessages = async (req, res) => {
    const log = logger.child({
        handler: "ChatController.fetchMessages",
        query: req.query,
        user: req.user?.id
    });
    try {
        const userId = req.user.id;
        let { chatRoomId, page = 1, limit = 20 } = req.query;

        chatRoomId = Number(chatRoomId);
        page = Number(page);
        limit = Number(limit);

        if (!chatRoomId || isNaN(chatRoomId)) {
            return sendResponse({
                res,
                status: 400,
                tag: "invalidChatRoomId",
                message: "chatRoomId must be a valid number",
                log
            });
        }

        // 🔒 Check participant
        const participant = await prisma.chatParticipant.findFirst({
            where: { chatRoomId, userId }
        });

        if (!participant) {
            return sendResponse({
                res,
                status: 403,
                tag: "forbidden",
                message: "You are not a participant of this chat",
                log
            });
        }

        const skip = (page - 1) * limit;

        const [totalCount, messages] = await Promise.all([
            prisma.chatMessage.count({
                where: { chatRoomId }
            }),
            prisma.chatMessage.findMany({
                where: { chatRoomId },
                include: { file: true, sender: { select: { id: true, name: true } } },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit
            })
        ]);

        // Mark messages as read
        // await prisma.chatParticipant.update({
        //     where: { chatRoomId_userId: { chatRoomId, userId } },
        //     data: { lastReadAt: new Date() }
        // });

        const totalPages = Math.ceil(totalCount / limit);

        return sendResponse({
            res,
            status: 200,
            tag: "success",
            message: "Messages fetched successfully",
            data: {
                messages,
                pagination: {
                    totalCount,
                    totalPages,
                    page,
                    limit
                }
            },
            log
        });
    } catch (err) {
        log.error(err, "Unexpected error occurred while fetching student attendance.");

        if (err.code === "P1001") {
            return sendResponse({
                res,
                status: 503,
                tag: "databaseUnavailable",
                message: "Database connection failed. Please try again later.",
                log
            });
        }

        return sendResponse({
            res,
            status: 500,
            tag: "serverError",
            message: "An internal server error occurred.",
            log
        });
    }
};