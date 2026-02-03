const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1) Create Fee Structure
exports.create = async (req, res) => {
  try {
    const { name, code, description, phase_id, subgroup_id,total_amount } = req.body;
    const user_id = req.user.id; // from authMiddleware

    console.log("user_id:", user_id);

    // 🔹 Fetch institution_id based on user_id
    const staff = await prisma.staffRegistration.findFirst({
      where: { user_id },
      select: { institution_id: true },
    });

    const student = !staff ? await prisma.studentRegistration.findFirst({
      where: { user_id },
      select: { institution_id: true },
    }) : null;

    const institution_id = staff?.institution_id || student?.institution_id;

    if (!institution_id) {
      return res.status(400).json({
        success: false,
        message: "Institution not found for this user",
      });
    }

    // 🔹 Create Fee Structure
    const structure = await prisma.feeStructure.create({
      data: { name, code, description, phase_id, subgroup_id, institution_id,total_amount },
    });

    return res.status(201).json({
      success: true,
      message: "Fee structure created successfully",
      data: structure,
    });

  } catch (err) {
    console.error("Fee Structure Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 2) Add Heads to Fee Structure
exports.addHeads = async (req, res) => {
  try {
    const fee_structure_id = Number(req.params.id);
    const { heads } = req.body;
    console.log("Heads",heads);
    // ✅ Ensure Fee Structure exists
    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id: fee_structure_id }
    });

    if (!feeStructure) {
      return res.status(404).json({
        success: false,
        message: "Fee Structure not found"
      });
    }

    const institution_id = feeStructure.institution_id;

    const createdHeads = [];

    // ✅ Loop through heads — create FeeHead if missing, then link
    for (const h of heads) {
      let fee_head_id = h.fee_head_id;

      // 🆕 Create FeeHead if not provided
      if (!fee_head_id) {
        const newHead = await prisma.feeHead.create({
          data: {
            institution_id,
            name: h.name,
            code: h.code || h.name.toUpperCase().replace(/\s+/g, "_"),
            description: h.description || null,
            is_mandatory: h.is_mandatory ?? true,
            default_amount: h.amount || 0,
            currency: h.currency || "INR"
          }
        });
        fee_head_id = newHead.id;
      }

      // 🔗 Link FeeHead to FeeStructure
      const structureHead = await prisma.feeStructureHead.create({
        data: {
          fee_structure_id,
          fee_head_id,
          amount: h.amount,
          is_optional: h.is_optional ?? false
        }
      });

      createdHeads.push(structureHead);
    }

    return res.status(201).json({
      success: true,
      message: "Heads added successfully",
      data: createdHeads
    });

  } catch (err) {
    console.error("AddHeads Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};



// 3) Add Installments
exports.addInstallments = async (req, res) => {
  try {
    const fee_structure_id = Number(req.params.id);
    const { installments } = req.body;

    const result = await prisma.feeInstallment.createMany({
      data: installments.map(inst => ({
        fee_structure_id,
        installment_no: inst.installment_no,
        installment_type: inst.installment_type,
        due_date: inst.due_date,
        amount: inst.amount
      }))
    });

    return res.status(201).json({
      success: true,
      message: "Installments added successfully",
      data: result
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 4) Add Discounts
exports.addDiscounts = async (req, res) => {
  try {
    const fee_structure_id = Number(req.params.id);
    const { discounts } = req.body;

    const result = await prisma.feeDiscount.createMany({
      data: discounts.map(d => ({
        fee_structure_id,
        name: d.name,
        description: d.description,
        discount_type: d.discount_type,
        amount: d.amount,
        applies_to_head_id: d.applies_to_head_id
      }))
    });

    return res.status(201).json({
      success: true,
      message: "Discounts added successfully",
      data: result
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 5) Add Fine Rules
exports.addFineRules = async (req, res) => {
  try {
    const fee_structure_id = Number(req.params.id);
    const { fine_rules } = req.body;

    const result = await prisma.feeFineRule.createMany({
      data: fine_rules.map(f => ({
        fee_structure_id,
        name: f.name,
        description: f.description,
        fine_type: f.fine_type,
        value: f.value,
        grace_period_days: f.grace_period_days
      }))
    });

    return res.status(201).json({
      success: true,
      message: "Fine rules added successfully",
      data: result
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 6) Get All Fee Structures
exports.list = async (req, res) => {
  try {
    const user_id = req.user.id;
    console.log("Listing Fee Structures for user_id:", user_id);

    // ✅ Get institution_id dynamically
    const staff = await prisma.staffRegistration.findFirst({
      where: { user_id },
      select: { institution_id: true },
    });

    const student = !staff ? await prisma.studentRegistration.findFirst({
      where: { user_id },
      select: { institution_id: true },
    }) : null;

    const institution_id = staff?.institution_id || student?.institution_id;

    if (!institution_id) {
      return res.status(400).json({
        success: false,
        message: "Institution not found for this user",
      });
    }

    const structures = await prisma.feeStructure.findMany({
      where: { institution_id },
    });

    return res.json({
      success: true,
      message: "Fee structures fetched successfully",
      data: structures,
    });

  } catch (err) {
    console.error("List FeeStructures Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


// 7) Get Complete Structure
exports.getFull = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const structure = await prisma.feeStructure.findUnique({
      where: { id },
      include: {
        heads: true,
        installments: true,
        discounts: true,
        fine_rules: true
      }
    });

    return res.json({
      success: true,
      message: "Fee structure details fetched",
      data: structure
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
