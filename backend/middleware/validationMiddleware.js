// Validation middleware for user data
const validateUserData = (req, res, next) => {
  const { name, email, userType, contactNumber } = req.body;
  
  if (!name || !email || !userType) {
    return res.status(400).json({ 
      message: 'Missing required fields', 
      required: ['name', 'email', 'userType']
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  
  // Validate user type
  const validUserTypes = ['admin', 'parent', 'driver'];
  if (!validUserTypes.includes(userType)) {
    return res.status(400).json({ 
      message: 'Invalid user type', 
      validTypes: validUserTypes 
    });
  }
  
  // Validate contact number format if provided
  if (contactNumber) {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(contactNumber)) {
      return res.status(400).json({ message: 'Invalid contact number format' });
    }
  }
  
  next();
};

// Validation middleware for child data
const validateChildData = (req, res, next) => {
  const { name, dateOfBirth, grade, schoolId, parentId } = req.body;
  
  if (!name || !dateOfBirth || !grade || !schoolId || !parentId) {
    return res.status(400).json({ 
      message: 'Missing required fields', 
      required: ['name', 'dateOfBirth', 'grade', 'schoolId', 'parentId']
    });
  }
  
  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateOfBirth)) {
    return res.status(400).json({ message: 'Invalid date format, required: YYYY-MM-DD' });
  }
  
  // Validate grade format (number or text)
  if (isNaN(grade) && typeof grade !== 'string') {
    return res.status(400).json({ message: 'Grade must be a number or text' });
  }
  
  next();
};

// Validation middleware for driver data
const validateDriverData = (req, res, next) => {
  const { name, dateOfBirth, nicNumber, experience, address, userId } = req.body;
  
  if (!name || !dateOfBirth || !nicNumber || !address || !userId) {
    return res.status(400).json({ 
      message: 'Missing required fields', 
      required: ['name', 'dateOfBirth', 'nicNumber', 'address', 'userId']
    });
  }
  
  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateOfBirth)) {
    return res.status(400).json({ message: 'Invalid date format, required: YYYY-MM-DD' });
  }
  
  // Validate experience (optional)
  if (experience && isNaN(experience)) {
    return res.status(400).json({ message: 'Experience must be a number' });
  }
  
  next();
};

// Validation middleware for vehicle data
const validateVehicleData = (req, res, next) => {
  const { vehicleNumber, capacity, startingLocation, driverId } = req.body;
  
  if (!vehicleNumber || !capacity || !startingLocation || !driverId) {
    return res.status(400).json({ 
      message: 'Missing required fields', 
      required: ['vehicleNumber', 'capacity', 'startingLocation', 'driverId']
    });
  }
  
  // Validate capacity
  if (isNaN(capacity) || capacity <= 0) {
    return res.status(400).json({ message: 'Capacity must be a positive number' });
  }
  
  // Validate starting location
  if (!startingLocation.latitude || !startingLocation.longitude) {
    return res.status(400).json({ 
      message: 'Invalid starting location', 
      required: { latitude: 'number', longitude: 'number' }
    });
  }
  
  next();
};

// Validation middleware for school data
const validateSchoolData = (req, res, next) => {
  const { name, address, location } = req.body;
  
  if (!name || !address) {
    return res.status(400).json({ 
      message: 'Missing required fields', 
      required: ['name', 'address']
    });
  }
  
  // Validate location if provided
  if (location && (!location.latitude || !location.longitude)) {
    return res.status(400).json({ 
      message: 'Invalid location', 
      required: { latitude: 'number', longitude: 'number' }
    });
  }
  
  next();
};

// Validation middleware for journey data
const validateJourneyData = (req, res, next) => {
  const { driverId, journeyType, date, children } = req.body;
  
  if (!driverId || !journeyType || !date) {
    return res.status(400).json({ 
      message: 'Missing required fields', 
      required: ['driverId', 'journeyType', 'date']
    });
  }
  
  // Validate journey type
  const validJourneyTypes = ['morning', 'evening'];
  if (!validJourneyTypes.includes(journeyType)) {
    return res.status(400).json({ 
      message: 'Invalid journey type', 
      validTypes: validJourneyTypes 
    });
  }
  
  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ message: 'Invalid date format, required: YYYY-MM-DD' });
  }
  
  // Validate children array if provided
  if (children && !Array.isArray(children)) {
    return res.status(400).json({ message: 'Children must be an array' });
  }
  
  next();
};

// Validation middleware for enrollment request
const validateEnrollmentRequest = (req, res, next) => {
  const { childId, driverId, parentId, schoolId } = req.body;
  
  if (!childId || !driverId || !parentId || !schoolId) {
    return res.status(400).json({ 
      message: 'Missing required fields', 
      required: ['childId', 'driverId', 'parentId', 'schoolId']
    });
  }
  
  next();
};

module.exports = {
  validateUserData,
  validateChildData,
  validateDriverData,
  validateVehicleData,
  validateSchoolData,
  validateJourneyData,
  validateEnrollmentRequest
}; 