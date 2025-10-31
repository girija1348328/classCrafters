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
