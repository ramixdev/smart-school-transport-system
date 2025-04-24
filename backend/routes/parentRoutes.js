const express = require('express');
const router = express.Router();
const multer = require('multer');
const { upload } = require('../utils/firebaseStorage');
const { 
  getParentProfile, 
  addChild, 
  updateChildDetails, 
  uploadChildProfileImage, 
  deleteChildProfile, 
  markChildAbsent, 
  requestDriverEnrollment, 
  getEnrollmentRequests 
} = require('../controllers/parentController');
const { verifyFirebaseToken, isParent } = require('../middleware/authMiddleware');
const { validateChildData, validateEnrollmentRequest } = require('../middleware/validationMiddleware');

// All routes are protected and require parent role
router.use(verifyFirebaseToken, isParent);

// Parent profile and children
router.get('/profile', getParentProfile);
router.post('/child', validateChildData, addChild);
router.put('/child/:childId', updateChildDetails);
router.post('/child/:childId/image', upload.single('image'), uploadChildProfileImage);
router.delete('/child/:childId', deleteChildProfile);

// Child attendance
router.post('/child/:childId/attendance', markChildAbsent);

// Driver enrollment
router.post('/enrollment', validateEnrollmentRequest, requestDriverEnrollment);
router.get('/enrollments', getEnrollmentRequests);

module.exports = router; 