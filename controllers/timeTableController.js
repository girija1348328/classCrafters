import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ➕ Create a timetable entry
 */
export const createTimetable = async (req, res) => {
    try {
        const {
            classId,
            subjectId,
            teacherId,
            day,
            period,
            startTime,
            endTime,
            startDate,
        } = req.body;

        // Prevent duplicate period for same class & day
        const existing = await prisma.timetable.findFirst({
            where: {
                classId,
                day,
                period,
            },
        });

        if (existing) {
            return res.status(400).json({
                message: "Timetable already exists for this class, day and period",
            });
        }

        const timetable = await prisma.timetable.create({
            data: {
                classId,
                subjectId,
                teacherId,
                day,
                period,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                startDate: new Date(startDate),
            },
            include: {
                class: true,
                subject: true,
                teacher: true,
            },
        });

        res.status(201).json({
            message: "Timetable created successfully",
            data: timetable,
        });
    } catch (error) {
        console.error("createTimetable error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getTimetableByClass = async (req, res) => {
    try {
        const classId = Number(req.params.classId);

        const timetable = await prisma.timetable.findMany({
            where: { classId },
            orderBy: [{ day: "asc" }, { period: "asc" }],
            include: {
                subject: true,
                teacher: true,
            },
        });

        res.json(timetable);
    } catch (error) {
        console.error("getTimetableByClass error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getTimetableByTeacher = async (req, res) => {
    try {
        const teacherId = Number(req.params.teacherId);

        const timetable = await prisma.timetable.findMany({
            where: { teacherId },
            orderBy: [{ day: "asc" }, { period: "asc" }],
            include: {
                class: true,
                subject: true,
            },
        });

        res.json(timetable);
    } catch (error) {
        console.error("getTimetableByTeacher error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const updateTimetable = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const timetable = await prisma.timetable.update({
            where: { id },
            data: req.body,
        });

        res.json({
            message: "Timetable updated successfully",
            data: timetable,
        });
    } catch (error) {
        console.error("updateTimetable error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteTimetable = async (req, res) => {
    try {
        const id = Number(req.params.id);

        await prisma.timetable.delete({
            where: { id },
        });

        res.json({ message: "Timetable deleted successfully" });
    } catch (error) {
        console.error("deleteTimetable error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

