const express = require('express');
const router = express.Router();
const { createInventory, getInventories, getInventoryById, updateInventory, deleteInventory, allocateInventory } = require('../controllers/inventoryController');

router.post('/inventories', createInventory);
router.get('/inventories', getInventories);
router.get('/inventories/:id', getInventoryById);
router.put('/inventories/:id', updateInventory);
router.delete('/inventories/:id', deleteInventory);
router.post('/inventories/:id/allocate', allocateInventory);

module.exports = router;
