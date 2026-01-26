const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/* ===============================
   CREATE ENQUIRY
================================ */
exports.createEnquiry = async (req, res) => {
    try {
        const {
            name,
            phone,
            email,
            address,
            description,
            source,
            classroomId,
            assignedUserId,
        } = req.body;

        const enquiry = await prisma.enquiry.create({
            data: {
                name,
                phone,
                email,
                address,
                description,
                source,
                classroomId,
                assignedUserId,
            },
        });

        res.status(201).json({
            success: true,
            message: "Enquiry created successfully",
            data: enquiry,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to create enquiry" });
    }
};

/* ===============================
   GET ALL ENQUIRIES (with filters)
================================ */
exports.getAllEnquiries = async (req, res) => {
    try {
        const { status, assignedUserId } = req.query;

        const enquiries = await prisma.enquiry.findMany({
            where: {
                status: status || undefined,
                assignedUserId: assignedUserId ? Number(assignedUserId) : undefined,
            },
            include: {
                assignedUser: true,
                classroom: true,
            },
            orderBy: { created_at: "desc" },
        });

        res.json({ success: true, data: enquiries });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch enquiries" });
    }
};

/* ===============================
   GET SINGLE ENQUIRY
================================ */
exports.getEnquiryById = async (req, res) => {
    try {
        const { id } = req.params;

        const enquiry = await prisma.enquiry.findUnique({
            where: { id: Number(id) },
            include: {
                assignedUser: true,
                classroom: true,
            },
        });

        if (!enquiry) {
            return res.status(404).json({ success: false, message: "Enquiry not found" });
        }

        res.json({ success: true, data: enquiry });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch enquiry" });
    }
};


exports.getFilteredEnquiries = async (req, res) => {
    try {
        const {
            classroomId,
            status,
            fromDate,
            toDate
        } = req.query;


        const filters = {};

        if (classroomId) {
            filters.classroomId = Number(classroomId);
        }

        if (status) {
            filters.status = status;
        }

        if (fromDate || toDate) {
            filters.enquiryDate = {};

            if (fromDate) {
                filters.enquiryDate.gte = new Date(fromDate);
            }

            if (toDate) {
                filters.enquiryDate.lte = new Date(toDate);
            }
        }


        const enquiries = await prisma.enquiry.findMany({
            where: filters,
            include: {
                assignedUser: true,
                classroom: true
            },
            orderBy: {
                enquiryDate: "desc"
            }
        });


        res.status(200).json({
            success: true,
            count: enquiries.length,
            data: enquiries
        });

    } catch (error) {
        console.error("❌ ENQUIRY FILTER ERROR =>", error.message || error);

        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch enquiry"
        });
    }
};


/* ===============================
   UPDATE ENQUIRY
================================ */
exports.updateEnquiry = async (req, res) => {
    try {
        const { id } = req.params;

        const enquiry = await prisma.enquiry.update({
            where: { id: Number(id) },
            data: req.body,
        });

        res.json({
            success: true,
            message: "Enquiry updated successfully",
            data: enquiry,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update enquiry" });
    }
};

/* ===============================
   DELETE ENQUIRY
================================ */
exports.deleteEnquiry = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.enquiry.delete({
            where: { id: Number(id) },
        });

        res.json({ success: true, message: "Enquiry deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete enquiry" });
    }
};

/* ===============================
   FOLLOW-UP ACTION
================================ */
exports.followUpEnquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const { nextFollowUpDate, status, remarks } = req.body;

        const enquiry = await prisma.enquiry.update({
            where: { id: Number(id) },
            data: {
                nextFollowUpDate,
                status,
                description: remarks, // optional overwrite
            },
        });

        res.json({
            success: true,
            message: "Follow-up updated",
            data: enquiry,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update follow-up" });
    }
};


/* ===============================
   CREATE VISITOR (ENTRY)
================================ */
exports.createVisitor = async (req, res) => {
    try {
        const {
            visitorName,
            phone,
            purpose,
            meetingWith,
            idCard,
            numberOfPerson,
            note,
            date,
            inTime,
        } = req.body;

        const visitor = await prisma.visitorBook.create({
            data: {
                visitorName,
                phone,
                purpose,
                meetingWith,
                idCard,
                numberOfPerson,
                note,
                date,
                inTime,
            }
        });

        res.status(201).json({
            success: true,
            message: "Visitor entry created",
            data: visitor
        });

    } catch (error) {
        console.error("CREATE VISITOR ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===============================
   GET ALL VISITORS (FILTERS)
================================ */
exports.getAllVisitors = async (req, res) => {
    try {
        console.log("✅ GET ALL VISITORS - Query Params:", req.query);
        const { meetingWith, fromDate, toDate, active } = req.query;

        const where = {};

        if (meetingWith) {
            where.meetingWith = meetingWith.toUpperCase();
        }

        if (active === "true") {
            where.outTime = null;
        }

        if (fromDate || toDate) {
            where.inTime = {};
            if (fromDate) where.inTime.gte = new Date(fromDate);
            if (toDate) where.inTime.lte = new Date(toDate);
        }

        const visitors = await prisma.visitorBook.findMany({
            where,
            orderBy: { inTime: "desc" }
        });

        res.json({
            success: true,
            count: visitors.length,
            data: visitors
        });

    } catch (error) {
        console.error("GET VISITORS ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===============================
   GET VISITOR BY ID
================================ */
exports.getVisitorById = async (req, res) => {
    try {
        const { id } = req.params;

        const visitor = await prisma.visitorBook.findUnique({
            where: { id: Number(id) }
        });

        if (!visitor) {
            return res.status(404).json({
                success: false,
                message: "Visitor not found"
            });
        }

        res.json({ success: true, data: visitor });

    } catch (error) {
        console.error("GET VISITOR ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===============================
   UPDATE VISITOR
================================ */
exports.updateVisitor = async (req, res) => {
    try {
        const { id } = req.params;

        const visitor = await prisma.visitorBook.update({
            where: { id: Number(id) },
            data: req.body
        });

        res.json({
            success: true,
            message: "Visitor updated",
            data: visitor
        });

    } catch (error) {
        console.error("UPDATE VISITOR ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===============================
   DELETE VISITOR
================================ */
exports.deleteVisitor = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.visitorBook.delete({
            where: { id: Number(id) }
        });

        res.json({
            success: true,
            message: "Visitor deleted"
        });

    } catch (error) {
        console.error("DELETE VISITOR ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===============================
   VISITOR EXIT
================================ */
exports.exitVisitor = async (req, res) => {
    try {
        const { id } = req.params;

        const visitor = await prisma.visitorBook.update({
            where: { id: Number(id) },
            data: {
                outTime: new Date()
            }
        });

        res.json({
            success: true,
            message: "Visitor exited",
            data: visitor
        });

    } catch (error) {
        console.error("EXIT VISITOR ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===============================
   TODAY VISITORS
================================ */
exports.getTodayVisitors = async (req, res) => {
    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const visitors = await prisma.visitorBook.findMany({
            where: {
                inTime: {
                    gte: start,
                    lte: end
                }
            },
            orderBy: { inTime: "desc" }
        });

        res.json({
            success: true,
            count: visitors.length,
            data: visitors
        });

    } catch (error) {
        console.error("TODAY VISITORS ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ===============================
   ACTIVE VISITORS (INSIDE)
================================ */
exports.getActiveVisitors = async (req, res) => {
    try {
        const visitors = await prisma.visitorBook.findMany({
            where: { outTime: null },
            orderBy: { inTime: "desc" }
        });

        res.json({
            success: true,
            count: visitors.length,
            data: visitors
        });

    } catch (error) {
        console.error("ACTIVE VISITORS ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createDispatch = async (req, res) => {
    try {
        const { referenceNo, address, note, fromTitle, date } = req.body;
        const dispatch = await prisma.dispatch.create({
            data: {
                referenceNo,
                address,
                note,
                fromTitle,
                date
            }

        });
        res.status(201).json({
            success: true,
            message: "Dispatch created",
            data: dispatch
        });
    }
    catch (error) {
        console.error("CREATE DISPATCH ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

exports.getDispatch = async (req, res) => {
    try {
        const dispatches = await prisma.dispatch.findMany({
            orderBy: { date: "desc" }
        });
        res.json({
            success: true,
            count: dispatches.length,
            data: dispatches
        });
    }
    catch (error) {
        console.error("GET DISPATCH ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getDispatchById = async (req, res) => {
    try {
        const { id } = req.params;
        const dispatch = await prisma.dispatch.findUnique({
            where: { id: Number(id) }
        });
        if (!dispatch) {
            return res.status(404).json({
                success: false,
                message: "Dispatch not found"
            });
        }
        res.json({ success: true, data: dispatch });
    } catch (error) {
        console.error("GET DISPATCH ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateDispatch = async (req, res) => {
    try {
        const { id } = req.params;
        const dispatch = await prisma.dispatch.update({
            where: { id: Number(id) },
            data: req.body
        });
        res.json({
            success: true,
            message: "Dispatch updated",
            data: dispatch
        });
    }

    catch (error) {
        console.error("UPDATE DISPATCH ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

exports.deleteDispatch = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.dispatch.delete({
            where: { id: Number(id) }
        });
        res.json({
            success: true,
            message: "Dispatch deleted"
        });
    }
    catch (error) {
        console.error("DELETE DISPATCH ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


//===============================

//receive

exports.createReceivePostal = async (req, res) => {
    try {
        const { referenceNo, address, note, toTitle } = req.body;
        const receivePostal = await prisma.receive.create({
            data: {
                referenceNo,
                address,
                note,
                toTitle
            }
        });

        return res.status(201).json({
            success: true,
            message: "Receive postal created",
            data: receivePostal
        });
    }

    catch (error) {
        console.error("CREATE RECEIVE POSTAL ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

exports.getReceivePostals = async (req, res) => {
    try {
        const receivePostals = await prisma.receive.findMany({
            orderBy: { created_at: "desc" }
        });
        res.json({
            success: true,
            count: receivePostals.length,
            data: receivePostals
        });
    }
    catch (error) {
        console.error("GET RECEIVE POSTALS ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getReceivePostalsById = async (req, res) => {
    try {
        const { id } = req.params;
        const receivePostal = await prisma.receive.findUnique({
            where: { id: Number(id) }
        });
        if (!receivePostal) {
            return res.status(404).json({
                success: false,
                message: "Receive postal not found"
            });
        }
        res.json({ success: true, data: receivePostal });
    }   

    catch (error) {
        console.error("GET RECEIVE POSTAL ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateReceivePostal = async (req, res) => {
    try {
        const { id } = req.params;
        const receivePostal = await prisma.receive.update({
            where: { id: Number(id) },
            data: req.body
        });
        res.json({
            success: true,
            message: "Receive postal updated",
            data: receivePostal
        });
    }

    catch (error) {
        console.error("UPDATE RECEIVE POSTAL ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

exports.deleteReceivePostal = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.receive.update({
            where: { id: Number(id) },  
            data: { isDeleted: true }
        });
        res.json({
            success: true,
            message: "Receive postal deleted"
        });
    }

    catch (error) {
        console.error("DELETE RECEIVE POSTAL ERROR:", error);
        res.status(500).json({  
            success: false,
            message: error.message
        });
    }
}

exports.createComplaint = async (req, res) => {
    // To be implemented
    try{
        const {complaint,source,complainBy,phone,date,description,actionTaken,assign,note}  = req.body;
        const complaintData = await prisma.complain.create({
            data: {
                complaint,
                source,
                complainBy,
                phone,
                date,
                description,
                actionTaken,
                assign,
                note
            }
        });
        return res.status(201).json({
            success: true,
            message: "Complaint created",
            data: complaintData
        });
    }
    catch(error){
        console.error("CREATE COMPLAINT ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });

    }
}

exports.getComplaints = async (req, res) => {
    // To be implemented
    try{
        const complaints = await prisma.complain.findMany({
            orderBy: { date: "desc" }
        });
        res.json({
            success: true,
            count: complaints.length,
            data: complaints
        });
    }   
    catch (error) {
        console.error("GET COMPLAINTS ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }   
};

exports.getComplaintById = async (req, res) => {    
    // To be implemented
    try{
        const { id } = req.params;
        const complaint = await prisma.complain.findUnique({
            where: { id: Number(id) }
        }); 
        if (!complaint) {
            return res.status(404).json({
                success: false, 
                message: "Complaint not found"
            });
        }
        res.json({ success: true, data: complaint });
    }   
    catch (error) {
        console.error("GET COMPLAINT ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateComplaint = async (req, res) => {
    // To be implemented
    try{
        const { id } = req.params;
        const complaint = await prisma.complain.update({
            where: { id: Number(id) },
            data: req.body
        });
        res.json({
            success: true,
            message: "Complaint updated",
            data: complaint
        });
    }
    catch (error) {
        console.error("UPDATE COMPLAINT ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }   
}

exports.deleteComplaint = async (req, res) => { 
    // To be implemented
    try{
        const { id } = req.params;  
        await prisma.complain.update({
            where: { id: Number(id) },
            data: { isDeleted: true }
        });
        res.json({
            success: true,
            message: "Complaint deleted"
        });
    }
    catch (error) {
        console.error("DELETE COMPLAINT ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
