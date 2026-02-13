const { PrismaClient,InventoryCategory,InventoryStatus } = require("@prisma/client");

const prisma = new PrismaClient();

/* =====================================================
   CREATE INVENTORY ITEM
===================================================== */
exports.createInventory = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      quantity,
      purchaseDate,
      purchasePrice,
      vendor,
      institutionId
    } = req.body;

    const formattedCategory = category?.toUpperCase();

    if (!InventoryCategory[formattedCategory]) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Allowed: ${Object.keys(InventoryCategory).join(", ")}`
      });
    }

    const inventory = await prisma.inventory.create({
      data: {
        name,
        category: InventoryCategory[formattedCategory],
        description,
        quantity: Number(quantity),
        availableQty: Number(quantity),
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchasePrice: purchasePrice ? Number(purchasePrice) : null,
        vendor,
        institution: {
          connect: { id: Number(institutionId) }
        }
      }
    });

    res.status(201).json({ success: true, inventory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =====================================================
   GET ALL INVENTORY ITEMS
===================================================== */
exports.getInventories = async (req, res) => {
  try {
    const inventories = await prisma.inventory.findMany({
      include: {
        institution: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ success: true, inventories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =====================================================
   GET SINGLE INVENTORY ITEM
===================================================== */
exports.getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const inventory = await prisma.inventory.findUnique({
      where: { id: Number(id) },
      include: {
        allocations: true
      }
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found"
      });
    }

    res.json({ success: true, inventory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =====================================================
   UPDATE INVENTORY ITEM
===================================================== */

exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      description,
      quantity,
      purchaseDate,
      purchasePrice,
      vendor,
      status
    } = req.body;

    const dataToUpdate = {};

    if (name) dataToUpdate.name = name;
    if (description) dataToUpdate.description = description;
    if (vendor) dataToUpdate.vendor = vendor;

    if (category) {
      const formattedCategory = category.toUpperCase();
      if (!InventoryCategory[formattedCategory]) {
        return res.status(400).json({
          success: false,
          message: "Invalid category"
        });
      }
      dataToUpdate.category = InventoryCategory[formattedCategory];
    }

    if (status) {
      const formattedStatus = status.toUpperCase();
      if (!InventoryStatus[formattedStatus]) {
        return res.status(400).json({
          success: false,
          message: "Invalid status"
        });
      }
      dataToUpdate.status = InventoryStatus[formattedStatus];
    }

    if (quantity) {
      dataToUpdate.quantity = Number(quantity);
      dataToUpdate.availableQty = Number(quantity);
    }

    if (purchaseDate)
      dataToUpdate.purchaseDate = new Date(purchaseDate);

    if (purchasePrice)
      dataToUpdate.purchasePrice = Number(purchasePrice);

    const updated = await prisma.inventory.update({
      where: { id: Number(id) },
      data: dataToUpdate
    });

    res.json({ success: true, updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =====================================================
   DELETE INVENTORY ITEM
===================================================== */
exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.inventory.delete({
      where: { id: Number(id) }
    });

    res.json({ success: true, message: "Inventory deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =====================================================
 ALLOCATE INVENTORY ITEM
===================================================== */
exports.allocateInventory = async (req, res) => {
  try {
    const { inventoryId, staffId, classroomId, quantity } = req.body;

    const item = await prisma.inventory.findUnique({
      where: { id: Number(inventoryId) }
    });

    if (!item || item.availableQty < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough inventory available"
      });
    }

    const allocation = await prisma.inventoryAllocation.create({
      data: {
        inventory: {
          connect: { id: Number(inventoryId) }
        },
        staff: staffId
          ? { connect: { id: Number(staffId) } }
          : undefined,
        classroom: classroomId
          ? { connect: { id: Number(classroomId) } }
          : undefined,
        quantity: Number(quantity)
      }
    });

    await prisma.inventory.update({
      where: { id: Number(inventoryId) },
      data: {
        availableQty: item.availableQty - quantity
      }
    });

    res.status(201).json({ success: true, allocation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

