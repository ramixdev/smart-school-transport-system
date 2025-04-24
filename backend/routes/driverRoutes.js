const express = require('express');
const router = express.Router();
const { upload } = require('../utils/firebaseStorage');
const { 
  getDriverProfile, 
  createDriverProfile, 
  updateDriverProfile, 
  uploadDriverProfileImage, 
  updateDriverVehicle, 
  uploadVehicleImages, 
  addSchool, 
  removeSchool, 
  getPendingEnrollments, 
  respondToEnrollment, 
  getEnrolledChildren, 
  removeChildFromDriver, 
  createNewJourney, 
  getJourneysByDate, 
  startDriverJourney, 
  endDriverJourney, 
  updateDriverLocation, 
  addJourneyStop 
} = require('../controllers/driverController');
const { verifyFirebaseToken, isDriver } = require('../middleware/authMiddleware');
const { 
  validateDriverData, 
  validateVehicleData, 
  validateJourneyData 
} = require('../middleware/validationMiddleware');

// All routes are protected and require driver role
router.use(verifyFirebaseToken, isDriver);

// Driver profile
router.get('/profile', getDriverProfile);
router.post('/profile', validateDriverData, createDriverProfile);
router.put('/profile', updateDriverProfile);
router.post('/profile/image', upload.single('image'), uploadDriverProfileImage);

// Vehicle management
router.post('/vehicle', validateVehicleData, updateDriverVehicle);
router.post('/vehicle/images', upload.array('images', 10), uploadVehicleImages);

// School management
router.post('/school', addSchool);
router.delete('/school/:schoolId', removeSchool);

// Enrollment management
router.get('/enrollments', getPendingEnrollments);
router.put('/enrollment/:enrollmentId', respondToEnrollment);
router.get('/children', getEnrolledChildren);
router.delete('/child/:childId', removeChildFromDriver);

// Journey management
router.post('/journey', validateJourneyData, createNewJourney);
router.get('/journeys', getJourneysByDate);
router.post('/journey/:journeyId/start', startDriverJourney);
router.post('/journey/:journeyId/end', endDriverJourney);
router.put('/journey/:journeyId/location', updateDriverLocation);
router.post('/journey/:journeyId/stop', addJourneyStop);

module.exports = router; 