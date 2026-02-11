const express = require('express');
const router = express.Router();
const {createAlumni, getAllAlumnis, getAlumniById, updateAlumni, deleteAlumni} = require('../controllers/alumniController');

router.get('/alumnis', getAllAlumnis);
router.get('/alumnis/:id', getAlumniById);
router.post('/alumnis', createAlumni);
router.patch('/alumnis/:id', updateAlumni);
router.delete('/alumnis/:id', deleteAlumni);

module.exports = router;