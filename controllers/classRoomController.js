const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


// Create a new classroom
const createClassroom = async (req, res) => {
    try {
        const { name, subject, description, teacherId } = req.body;

        // Check if teacher exists
        const teacher = await prisma.user.findUnique({
            where: { id: parseInt(teacherId) },
            include: { role: true }
        });

        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        if (teacher.role.name !== 'teacher') {
            return res.status(400).json({ error: 'User is not a teacher' });
        }

        const classroom = await prisma.classroom.create({
            data: {
                name,
                subject,
                description,
                teacherId: parseInt(teacherId)
            },
            include: {
                teacher: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.status(201).json({
            message: 'Classroom created successfully',
            classroom
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all classrooms
const getAllClassrooms = async (req, res) => {
    try {
        const classrooms = await prisma.classroom.findMany({
            include: {
                teacher: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                students: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                assignments: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({ classrooms });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get classroom by ID
const getClassroomById = async (req, res) => {
    try {
        const { id } = req.params;

        const classroom = await prisma.classroom.findUnique({
            where: { id: parseInt(id) },
            include: {
                teacher: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                students: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                assignments: {
                    include: {
                        submissions: true
                    }
                }
            }
        });

        if (!classroom) {
            return res.status(404).json({ error: 'Classroom not found' });
        }

        res.json({ classroom });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update classroom
const updateClassroom = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, subject, description } = req.body;

        const classroom = await prisma.classroom.update({
            where: { id: parseInt(id) },
            data: {
                name,
                subject,
                description
            },
            include: {
                teacher: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.json({
            message: 'Classroom updated successfully',
            classroom
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete classroom
const deleteClassroom = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.classroom.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Classroom deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add student to classroom
const addStudentToClassroom = async (req, res) => {
    try {
        const { classroomId, studentId } = req.body;

        // Check if classroom exists
        const classroom = await prisma.classroom.findUnique({
            where: { id: parseInt(classroomId) }
        });

        if (!classroom) {
            return res.status(404).json({ error: 'Classroom not found' });
        }

        // Check if student exists
        const student = await prisma.user.findUnique({
            where: { id: parseInt(studentId) }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Check if student is already in classroom
        const existingEnrollment = await prisma.classroomStudent.findFirst({
            where: {
                classroomId: parseInt(classroomId),
                studentId: parseInt(studentId)
            }
        });

        if (existingEnrollment) {
            return res.status(400).json({ error: 'Student already enrolled in this classroom' });
        }

        const enrollment = await prisma.classroomStudent.create({
            data: {
                classroomId: parseInt(classroomId),
                studentId: parseInt(studentId)
            },
            include: {
                classroom: true,
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
            message: 'Student added to classroom successfully',
            enrollment
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove student from classroom
const removeStudentFromClassroom = async (req, res) => {
    try {
        const { classroomId, studentId } = req.body;

        const enrollment = await prisma.classroomStudent.findFirst({
            where: {
                classroomId: parseInt(classroomId),
                studentId: parseInt(studentId)
            }
        });

        if (!enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }

        await prisma.classroomStudent.delete({
            where: { id: enrollment.id }
        });

        res.json({ message: 'Student removed from classroom successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get classroom students
const getClassroomStudents = async (req, res) => {
    try {
        const { classroomId } = req.params;

        const students = await prisma.classroomStudent.findMany({
            where: { classroomId: parseInt(classroomId) },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        res.json({ students });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get teacher's classrooms
const getTeacherClassrooms = async (req, res) => {
    try {
        const { teacherId } = req.params;

        const classrooms = await prisma.classroom.findMany({
            where: { teacherId: parseInt(teacherId) },
            include: {
                students: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                assignments: {
                    include: {
                        submissions: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({ classrooms });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get student's classrooms
const getStudentClassrooms = async (req, res) => {
    try {
        const { studentId } = req.params;

        const enrollments = await prisma.classroomStudent.findMany({
            where: { studentId: parseInt(studentId) },
            include: {
                classroom: {
                    include: {
                        teacher: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        },
                        assignments: true
                    }
                }
            }
        });

        const classrooms = enrollments.map(enrollment => enrollment.classroom);

        res.json({ classrooms });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const videoConferenceJitsi = async (req, res) => {
    try {
        const { room } = req.params;
        const user = req.user;

        if (!room) {
            return res.status(400).json({ error: "Room name is required" });
        }
        console.log("user:", user);

        const payload = {
            aud: "jitsi",
            iss: "chat",
            sub: process.env.JITSI_TENANT, // MUST match tenant
            room: room,
            exp: Math.floor(Date.now() / 1000) + 60 * 60,

            context: {
                user: {
                    name: "teacher",
                    email: user.email,
                    moderator: true,
                },
            },

            features: {
                recording: false,
                livestreaming: false,
                transcription: false,
                "outbound-call": false,
            },
        };

        const token = jwt.sign(
            payload,
            process.env.JITSI_PRIVATE_KEY.replace(/\\n/g, "\n"),
            {
                algorithm: "RS256",
                header: {
                    kid: process.env.JITSI_KID, // MUST match dashboard
                    typ: "JWT",
                },
            }
        );
        console.log("Generated Jitsi JWT:", token);
        res.json({ token });
    } catch (error) {
        console.error("Jitsi JWT error:", error);
        res.status(500).json({ error: "Failed to generate token" });
    }
};

function generateZegoToken(
    appID,
    serverSecret,
    userID,
    roomID,
    effectiveTimeInSeconds = 3600
) {
    const payload = {
        app_id: appID,
        user_id: userID,
        nonce: Math.floor(Math.random() * 100000),
        ctime: Math.floor(Date.now() / 1000),
        expire: effectiveTimeInSeconds,
        payload: {
            room_id: roomID,
        },
    };

    const payloadString = JSON.stringify(payload);

    const signature = crypto
        .createHmac("sha256", serverSecret)
        .update(payloadString)
        .digest("hex");

    const token = Buffer.from(
        JSON.stringify({
            payload,
            signature,
        })
    ).toString("base64");

    return token;
}


const videoConferenceZego = async (req, res) => {
    try {
        const { classroomId } = req.params;
        const user = req.user; // from auth

        const roomID = `classroom-${classroomId}`;
        const userID = user.id.toString();

        const token = generateZegoToken(
            process.env.ZEGO_APP_ID,
            process.env.ZEGO_SERVER_SECRET,
            userID,
            roomID
        );
        console.log("Generated Zego JWT:", token);
        res.json({
            token,
            roomID,
            userID,
            userName:"Girija",
        });
    } catch (error) {
        console.error("Zego JWT error:", error);
        res.status(500).json({ error: "Failed to generate token" });
    }
}

module.exports = {
    createClassroom,
    getAllClassrooms,
    getClassroomById,
    updateClassroom,
    deleteClassroom,
    addStudentToClassroom,
    removeStudentFromClassroom,
    getClassroomStudents,
    getTeacherClassrooms,
    getStudentClassrooms,
    videoConferenceJitsi,
    videoConferenceZego
};
