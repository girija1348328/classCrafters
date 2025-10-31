const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.recordPayment = async (req, res) => {
  const tx = await prisma.$transaction(async (prismaTx) => {
    try {
      const {
        fee_assignment_id,
        student_registration_id,
        payment_mode,
        amount,
        payment_heads,
        note
      } = req.body;

      const received_by_id = req.user.id; // from auth middleware

      // ✅ 1. Validate Fee Assignment
      const assignment = await prismaTx.feeAssignment.findUnique({
        where: { id: fee_assignment_id },
      });

      if (!assignment) {
        throw new Error("Fee assignment not found");
      }

      // ✅ 2. Create Payment Record
      const payment = await prismaTx.feePayment.create({
        data: {
          fee_assignment_id,
          student_registration_id,
          payment_mode,
          amount,
          status: "PAID",
          received_by_id,
          note
        }
      });

      // ✅ 3. Create FeePaymentHead records (if provided)
      if (payment_heads && payment_heads.length > 0) {
        await prismaTx.feePaymentHead.createMany({
          data: payment_heads.map((h) => ({
            fee_payment_id: payment.id,
            fee_head_id: h.fee_head_id,
            amount: h.amount
          }))
        });
      }

      // ✅ 4. Update FeeAssignment balance & status
      const newOutstanding = Number(assignment.outstanding_amount) - Number(amount);
      const newStatus =
        newOutstanding <= 0
          ? "PAID"
          : newOutstanding < Number(assignment.total_amount)
          ? "PARTIAL"
          : "PENDING";

      const updatedAssignment = await prismaTx.feeAssignment.update({
        where: { id: fee_assignment_id },
        data: {
          due_amount: newOutstanding > 0 ? newOutstanding : 0,
          outstanding_amount: newOutstanding > 0 ? newOutstanding : 0,
          status: newStatus
        }
      });

      // ✅ 5. Add Ledger Entry
      await prismaTx.feeLedger.create({
        data: {
          fee_assignment_id,
          entry_type: "PAYMENT",
          amount,
          balance_after: newOutstanding,
          note: `Payment received via ${payment_mode}`
        }
      });

      return {
        success: true,
        message: "Payment recorded successfully",
        data: {
          payment,
          updatedAssignment
        }
      };
    } catch (err) {
      console.error("Payment Error:", err);
      throw err;
    }
  });

  // ✅ Response after successful transaction
  res.status(201).json(tx);
};
