const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


exports.recordPayment = async (req, res) => {
  try {
    const {
      fee_assignment_id,
      student_registration_id,
      payment_mode,
      amount,
      payment_heads,
      note
    } = req.body;

    const received_by_id = req.user.id;

    // ✅ Validate Fee Assignment
    const assignment = await prisma.feeAssignment.findUnique({
      where: { id: fee_assignment_id },
    });
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Fee assignment not found" });
    }

    // =============================
    // 💳 CASE 1: ONLINE PAYMENT
    // =============================
    if (payment_mode === "ONLINE") {
      const order = await razorpay.orders.create({
        amount: amount * 100, // Razorpay expects paise
        currency: "INR",
        receipt: `FEE-${fee_assignment_id}-${Date.now()}`,
        notes: {
          fee_assignment_id: fee_assignment_id.toString(),
          student_registration_id: student_registration_id.toString(),
        },
      });

      // Store order in DB with status = PENDING
      const payment = await prisma.feePayment.create({
        data: {
          fee_assignment_id,
          student_registration_id,
          payment_mode: "ONLINE",
          amount,
          status: "PENDING",
          razorpay_order_id: order.id,
          received_by_id,
          note,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Razorpay order created",
        data: {
          order_id: order.id,
          key_id: process.env.RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          payment_id: payment.id,
        },
      });
    }

    // =============================
    // 💵 CASE 2: OFFLINE PAYMENT
    // =============================
    const tx = await prisma.$transaction(async (prismaTx) => {
      // Create payment
      const payment = await prismaTx.feePayment.create({
        data: {
          fee_assignment_id,
          student_registration_id,
          payment_mode,
          amount,
          status: "PAID",
          received_by_id,
          note,
        },
      });

      // Payment heads
      if (payment_heads && payment_heads.length > 0) {
        await prismaTx.feePaymentHead.createMany({
          data: payment_heads.map((h) => ({
            fee_payment_id: payment.id,
            fee_head_id: h.fee_head_id,
            amount: h.amount,
          })),
        });
      }

      // Update Fee Assignment
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
          status: newStatus,
        },
      });

      // Ledger entry
      await prismaTx.feeLedger.create({
        data: {
          fee_assignment_id,
          entry_type: "PAYMENT",
          amount,
          balance_after: newOutstanding,
          note: `Payment received via ${payment_mode}`,
        },
      });

      return { payment, updatedAssignment };
    });

    return res.status(201).json({
      success: true,
      message: "Offline payment recorded successfully",
      data: tx,
    });
  } catch (err) {
    console.error("Payment Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


exports.verifyOnlinePayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // ✅ Verify Signature
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // ✅ Update payment record
    const payment = await prisma.feePayment.updateMany({
      where: { razorpay_order_id },
      data: {
        razorpay_payment_id,
        status: "PAID",
        payment_date: new Date(),
      },
    });

    // Optional: also update FeeAssignment and add ledger entry
    // (similar to the offline case)

    res.json({ success: true, message: "Payment verified successfully", data: payment });
  } catch (err) {
    console.error("Verify Razorpay Payment Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

