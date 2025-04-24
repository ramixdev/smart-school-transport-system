const { getUserById } = require('../models/userModel');
const { 
  createDriver, 
  getDriverById, 
  updateDriver, 
  getDriversBySchool,
  updateVehicleDetails,
  addSchoolToDriver,
  removeSchoolFromDriver
} = require('../models/driverModel');
const { 
  getChildrenByDriverId, 
  updateChild,
  getChildById
} = require('../models/childModel');
const { 
  getPendingEnrollmentsByDriverId, 
  updateEnrollmentStatus,
  getEnrollmentById 
} = require('../models/enrollmentModel');
const {
  createJourney,
  getJourneysByDriverAndDate,
  startJourney,
  endJourney,
  updateJourneyLocation,
  addStopToJourney
} = require('../models/journeyModel');
const { uploadToFirebase } = require('../utils/firebaseStorage');

// Get driver profile
const getDriverProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    
    // Get driver user data
    const driver = await getDriverById(uid);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    res.status(200).json({ driver });
  } catch (error) {
    console.error('Error fetching driver profile:', error);
    res.status(500).json({ message: 'Error fetching driver profile', error: error.message });
  }
};

// Create or update driver profile
const createDriverProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const { name, dateOfBirth, nicNumber, experience, address } = req.body;
    
    // Create driver profile in Firestore
    const driverData = {
      name,
      dateOfBirth,
      nicNumber,
      experience: experience || 0,
      address,
      schools: [],
      vehicle: null,
      createdAt: new Date()
    };
    
    const driver = await createDriver(uid, driverData);
    
    res.status(201).json({ message: 'Driver profile created successfully', driver });
  } catch (error) {
    console.error('Error creating driver profile:', error);
    res.status(500).json({ message: 'Error creating driver profile', error: error.message });
  }
};

// Update driver profile
const updateDriverProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const { name, contactNumber, experience, address } = req.body;
    
    const driver = await getDriverById(uid);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    // Update driver data
    const updatedData = {
      ...(name && { name }),
      ...(contactNumber && { contactNumber }),
      ...(experience && { experience }),
      ...(address && { address }),
      updatedAt: new Date()
    };
    
    const updatedDriver = await updateDriver(uid, updatedData);
    
    res.status(200).json({ message: 'Driver profile updated successfully', driver: updatedDriver });
  } catch (error) {
    console.error('Error updating driver profile:', error);
    res.status(500).json({ message: 'Error updating driver profile', error: error.message });
  }
};

// Upload driver profile image
const uploadDriverProfileImage = async (req, res) => {
  try {
    const { uid } = req.user;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    // Upload the image to Firebase Storage
    const imageUrl = await uploadToFirebase(req.file, `drivers/${uid}`);
    
    // Update driver record with new image URL
    await updateDriver(uid, { profileImage: imageUrl });
    
    res.status(200).json({ message: 'Profile image uploaded successfully', imageUrl });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Error uploading profile image', error: error.message });
  }
};

// Update vehicle details
const updateDriverVehicle = async (req, res) => {
  try {
    const { uid } = req.user;
    const { vehicleNumber, capacity, startingLocation } = req.body;
    
    const driver = await getDriverById(uid);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    // Update vehicle details
    const vehicleData = {
      vehicleNumber,
      capacity: parseInt(capacity),
      startingLocation,
      updatedAt: new Date()
    };
    
    await updateVehicleDetails(uid, vehicleData);
    
    res.status(200).json({ message: 'Vehicle details updated successfully', vehicle: vehicleData });
  } catch (error) {
    console.error('Error updating vehicle details:', error);
    res.status(500).json({ message: 'Error updating vehicle details', error: error.message });
  }
};

// Upload vehicle images
const uploadVehicleImages = async (req, res) => {
  try {
    const { uid } = req.user;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }
    
    const imageUrls = [];
    
    // Upload each image to Firebase Storage
    for (const file of req.files) {
      const imageUrl = await uploadToFirebase(file, `vehicles/${uid}`);
      imageUrls.push(imageUrl);
    }
    
    // Get current driver data
    const driver = await getDriverById(uid);
    const currentVehicle = driver.vehicle || {};
    const currentImages = currentVehicle.images || [];
    
    // Update driver's vehicle with new images
    await updateVehicleDetails(uid, {
      ...currentVehicle,
      images: [...currentImages, ...imageUrls]
    });
    
    res.status(200).json({ message: 'Vehicle images uploaded successfully', imageUrls });
  } catch (error) {
    console.error('Error uploading vehicle images:', error);
    res.status(500).json({ message: 'Error uploading vehicle images', error: error.message });
  }
};

// Add school to driver
const addSchool = async (req, res) => {
  try {
    const { uid } = req.user;
    const { schoolId } = req.body;
    
    await addSchoolToDriver(uid, schoolId);
    
    res.status(200).json({ message: 'School added successfully' });
  } catch (error) {
    console.error('Error adding school:', error);
    res.status(500).json({ message: 'Error adding school', error: error.message });
  }
};

// Remove school from driver
const removeSchool = async (req, res) => {
  try {
    const { uid } = req.user;
    const { schoolId } = req.params;
    
    await removeSchoolFromDriver(uid, schoolId);
    
    res.status(200).json({ message: 'School removed successfully' });
  } catch (error) {
    console.error('Error removing school:', error);
    res.status(500).json({ message: 'Error removing school', error: error.message });
  }
};

// Get all pending enrollment requests
const getPendingEnrollments = async (req, res) => {
  try {
    const { uid } = req.user;
    
    const enrollments = await getPendingEnrollmentsByDriverId(uid);
    
    res.status(200).json({ enrollments });
  } catch (error) {
    console.error('Error fetching pending enrollments:', error);
    res.status(500).json({ message: 'Error fetching pending enrollments', error: error.message });
  }
};

// Accept or reject enrollment request
const respondToEnrollment = async (req, res) => {
  try {
    const { uid } = req.user;
    const { enrollmentId } = req.params;
    const { status, notes } = req.body;
    
    // Validate status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "accepted" or "rejected"' });
    }
    
    // Get enrollment details
    const enrollment = await getEnrollmentById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment request not found' });
    }
    
    // Verify this enrollment is for this driver
    if (enrollment.driverId !== uid) {
      return res.status(403).json({ message: 'You are not authorized to respond to this enrollment request' });
    }
    
    // Update enrollment status
    await updateEnrollmentStatus(enrollmentId, status, notes);
    
    // If accepted, update child record with driver ID
    if (status === 'accepted') {
      await updateChild(enrollment.childId, { driverId: uid });
    }
    
    res.status(200).json({ message: `Enrollment request ${status}` });
  } catch (error) {
    console.error('Error responding to enrollment:', error);
    res.status(500).json({ message: 'Error responding to enrollment', error: error.message });
  }
};

// Get all enrolled children
const getEnrolledChildren = async (req, res) => {
  try {
    const { uid } = req.user;
    
    const children = await getChildrenByDriverId(uid);
    
    res.status(200).json({ children });
  } catch (error) {
    console.error('Error fetching enrolled children:', error);
    res.status(500).json({ message: 'Error fetching enrolled children', error: error.message });
  }
};

// Remove child from driver
const removeChildFromDriver = async (req, res) => {
  try {
    const { uid } = req.user;
    const { childId } = req.params;
    
    // Check if child is enrolled with this driver
    const child = await getChildById(childId);
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    if (child.driverId !== uid) {
      return res.status(403).json({ message: 'This child is not enrolled with you' });
    }
    
    // Update child record to remove driver
    await updateChild(childId, { driverId: null });
    
    res.status(200).json({ message: 'Child removed successfully' });
  } catch (error) {
    console.error('Error removing child:', error);
    res.status(500).json({ message: 'Error removing child', error: error.message });
  }
};

// Create journey
const createNewJourney = async (req, res) => {
  try {
    const { uid } = req.user;
    const { journeyType, date, children } = req.body;
    
    // Create journey record
    const journeyData = {
      driverId: uid,
      journeyType,
      date: date || new Date().toISOString().split('T')[0],
      children: children || [],
      status: 'scheduled'
    };
    
    const journey = await createJourney(journeyData);
    
    res.status(201).json({ message: 'Journey created successfully', journey });
  } catch (error) {
    console.error('Error creating journey:', error);
    res.status(500).json({ message: 'Error creating journey', error: error.message });
  }
};

// Get journeys by date
const getJourneysByDate = async (req, res) => {
  try {
    const { uid } = req.user;
    const { date, journeyType } = req.query;
    
    const journeys = await getJourneysByDriverAndDate(uid, date, journeyType);
    
    res.status(200).json({ journeys });
  } catch (error) {
    console.error('Error fetching journeys:', error);
    res.status(500).json({ message: 'Error fetching journeys', error: error.message });
  }
};

// Start journey
const startDriverJourney = async (req, res) => {
  try {
    const { journeyId } = req.params;
    const { startLocation } = req.body;
    
    await startJourney(journeyId, startLocation);
    
    res.status(200).json({ message: 'Journey started successfully' });
  } catch (error) {
    console.error('Error starting journey:', error);
    res.status(500).json({ message: 'Error starting journey', error: error.message });
  }
};

// End journey
const endDriverJourney = async (req, res) => {
  try {
    const { journeyId } = req.params;
    
    await endJourney(journeyId);
    
    res.status(200).json({ message: 'Journey completed successfully' });
  } catch (error) {
    console.error('Error ending journey:', error);
    res.status(500).json({ message: 'Error ending journey', error: error.message });
  }
};

// Update journey location
const updateDriverLocation = async (req, res) => {
  try {
    const { journeyId } = req.params;
    const { location } = req.body;
    
    await updateJourneyLocation(journeyId, location);
    
    res.status(200).json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Error updating location', error: error.message });
  }
};

// Add stop to journey
const addJourneyStop = async (req, res) => {
  try {
    const { journeyId } = req.params;
    const { stopData } = req.body;
    
    await addStopToJourney(journeyId, stopData);
    
    res.status(200).json({ message: 'Stop added successfully' });
  } catch (error) {
    console.error('Error adding stop:', error);
    res.status(500).json({ message: 'Error adding stop', error: error.message });
  }
};

module.exports = {
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
}; 