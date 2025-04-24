const express = require('express');
const router = express.Router();
const { getAllSchoolsList, getSchool } = require('../controllers/schoolController');
const { getDriversBySchool } = require('../models/driverModel');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

// All routes require authentication but no specific role
router.use(verifyFirebaseToken);

// School routes for all users
router.get('/', getAllSchoolsList);
router.get('/:schoolId', getSchool);

// Get drivers by school
router.get('/:schoolId/drivers', async (req, res) => {
  try {
    const { schoolId } = req.params;
    const drivers = await getDriversBySchool(schoolId);
    res.status(200).json({ drivers });
  } catch (error) {
    console.error('Error fetching drivers by school:', error);
    res.status(500).json({ message: 'Error fetching drivers by school', error: error.message });
  }
});

module.exports = router; 