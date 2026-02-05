const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.assignFees = async (req, res) => {
  try {
    const { fee_structure_id, student_ids, due_date } = req.body;
    const assigned_by_id = req.user.id; // from authMiddleware

    // ✅ Validate Fee Structure
    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id: fee_structure_id },
      include: { heads: true, installments: true }
    });

    if (!feeStructure) {
      return res.status(404).json({ success: false, message: "Fee structure not found" });
    }

    // ✅ Calculate total amount (from heads or total_amount)
    const totalAmount =
      feeStructure.total_amount ||
      feeStructure.heads.reduce((sum, h) => sum + Number(h.amount), 0);

    console.log("Total Amount:", totalAmount);
    // ✅ Create Assignments for each student
    const feeAssignments = await Promise.all(
      student_ids.map(async (studentId) => {
        const assignment = await prisma.feeAssignment.create({
          data: {
            student_registration_id: studentId,
            fee_structure_id,
            assigned_by_id,
            assigned_on: new Date(),
            total_amount: totalAmount,
            due_amount: totalAmount,
            outstanding_amount: totalAmount,
            due_date: due_date ? new Date(due_date) : null,
            status: "PENDING"
          }
        });

        // ✅ Create initial ledger entry
        await prisma.feeLedger.create({
          data: {
            fee_assignment_id: assignment.id,
            entry_type: "CHARGE",
            amount: totalAmount,
            balance_after: totalAmount,
            note: "Initial fee assigned"
          }
        });

        return assignment;
      })
    );

    return res.status(201).json({
      success: true,
      message: "Fees assigned successfully",
      data: feeAssignments
    });
  } catch (err) {
    console.error("Assign Fees Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFeeAssignments = async (req, res) => {
  try {
    const { student_ids } = req.query; // ✅ FIX

    if (!student_ids) {
      return res.status(400).json({
        success: false,
        message: "student_ids is required",
      });
    }

    const feeAssignments = await prisma.feeAssignment.findMany({
      where: {
        student_registration_id: Number(student_ids), // ✅ FIX
      },
    });

    return res.status(200).json({
      success: true,
      message: "Fees retrieved successfully",
      data: feeAssignments,
    });
  } catch (err) {
    console.error("Get Fee Assignments Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


exports.getFeeAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const convertInt = Number(id);

    const feeAssignment = await prisma.feeAssignment.findUnique({
      where: { id: convertInt },
      include: {
        fee_structure: true,
        student_registration: true,
      },
    });

    if (!feeAssignment) {
      return res.status(404).json({ success: false, message: "Fee assignment not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Fee assignment retrieved successfully",
      data: feeAssignment,
    });
  } catch (err) {
    console.error("Get Fee Assignment Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateFeeAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { due_date, status } = req.body;

    const feeAssignment = await prisma.feeAssignment.update({
      where: { id },
      data: {
        due_date,
        status,
      },
      include: {
        feeStructure: true,
        student: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Fee assignment updated successfully",
      data: feeAssignment,
    });
  } catch (err) {
    console.error("Update Fee Assignment Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteFeeAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.feeAssignment.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Fee assignment deleted successfully",
    });
  } catch (err) {
    console.error("Delete Fee Assignment Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


exports.collectFees = async (req, res) => {
  try {
    const {
      fee_assignment_id,
      amount,
      payment_mode,
      payment_date,
      note,
    } = req.body;

    const received_by = req.user.id;

    if (!fee_assignment_id || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment data",
      });
    }

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Fetch assignment
      const feeAssignment = await tx.feeAssignment.findUnique({
        where: { id: fee_assignment_id },
      });

      if (!feeAssignment) {
        throw new Error("Fee assignment not found");
      }

      if (feeAssignment.outstanding_amount <= 0) {
        throw new Error("Fees already fully paid");
      }

      if (amount > feeAssignment.outstanding_amount) {
        throw new Error("Payment amount exceeds outstanding balance");
      }

      const newOutstanding =
        Number(feeAssignment.outstanding_amount) - Number(amount);

      const newStatus =
        newOutstanding === 0 ? "PAID" : "PARTIAL";

      // 2️⃣ Create payment (✅ FIXED)
      await tx.feePayment.create({
        data: {
          amount,
          payment_mode,
          payment_date: payment_date ? new Date(payment_date) : new Date(),
          received_by,
          note,

          received_by: {
            connect: { id: received_by },
          },

          fee_assignment: {
            connect: { id: fee_assignment_id },
          },

          student_registration: {
            connect: { id: feeAssignment.student_registration_id },
          },
        },
      });

      // 3️⃣ Update assignment
      await tx.feeAssignment.update({
        where: { id: fee_assignment_id },
        data: {
          outstanding_amount: newOutstanding,
          due_amount: newOutstanding,
          status: newStatus,
        },
      });

      // 4️⃣ Ledger entry
      await tx.feeLedger.create({
        data: {
          entry_type: "PAYMENT",
          amount,
          balance_after: newOutstanding,
          note: note || "Fee payment received",

          fee_assignment: {
            connect: { id: fee_assignment_id },
          },
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Payment recorded successfully",
    });
  } catch (err) {
    console.error("Pay Fees Error:", err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


