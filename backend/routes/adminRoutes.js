const express = require('express');
const router = express.Router();
const { 
  getAllUsersAdmin, 
  getUsersByTypeAdmin, 
  deleteUserByIdAdmin 
} = require('../controllers/userController');
const { 
  getAllSchoolsList, 
  getSchool, 
  addSchool, 
  updateSchoolDetails, 
  removeSchool 
} = require('../controllers/schoolController');
const { 
  getDashboardStats, 
  getAllDriversWithDetails, 
  getAllStudents, 
  getStudentsBySchool, 
  deleteStudent, 
  deleteDriver 
} = require('../controllers/adminController');
const { verifyFirebaseToken, isAdmin } = require('../middleware/authMiddleware');
const { validateSchoolData } = require('../middleware/validationMiddleware');

// All routes are protected and require admin role
router.use(verifyFirebaseToken, isAdmin);

// Dashboard statistics
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsersAdmin);
router.get('/users/:userType', getUsersByTypeAdmin);
router.delete('/user/:userId', deleteUserByIdAdmin);

// Driver management
router.get('/drivers', getAllDriversWithDetails);
router.delete('/driver/:driverId', deleteDriver);

// Student management
router.get('/students', getAllStudents);
router.get('/students/school/:schoolId', getStudentsBySchool);
router.delete('/student/:childId', deleteStudent);

// School management
router.get('/schools', getAllSchoolsList);
router.get('/school/:schoolId', getSchool);
router.post('/school', validateSchoolData, addSchool);
router.put('/school/:schoolId', validateSchoolData, updateSchoolDetails);
router.delete('/school/:schoolId', removeSchool);

module.exports = router; 