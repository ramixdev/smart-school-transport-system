const { db } = require('../config/firebase');

const schoolsCollection = db.collection('schools');

// Create new school
const createSchool = async (schoolData) => {
  try {
    const schoolRef = await schoolsCollection.add({
      ...schoolData,
      createdAt: new Date(),
      status: 'active',
      location: {
        latitude: schoolData.location.latitude,
        longitude: schoolData.location.longitude,
        address: schoolData.location.address
      },
      enrolledStudents: 0,
      enrolledDrivers: 0
    });
    return { id: schoolRef.id, ...schoolData };
  } catch (error) {
    throw new Error(`Error creating school: ${error.message}`);
  }
};

// Get school by ID
const getSchoolById = async (schoolId) => {
  try {
    const schoolDoc = await schoolsCollection.doc(schoolId).get();
    if (!schoolDoc.exists) {
      return null;
    }
    return { id: schoolDoc.id, ...schoolDoc.data() };
  } catch (error) {
    throw new Error(`Error getting school: ${error.message}`);
  }
};

// Update school
const updateSchool = async (schoolId, schoolData) => {
  try {
    await schoolsCollection.doc(schoolId).update({
      ...schoolData,
      updatedAt: new Date()
    });
    return { id: schoolId, ...schoolData };
  } catch (error) {
    throw new Error(`Error updating school: ${error.message}`);
  }
};

// Delete school
const deleteSchool = async (schoolId) => {
  try {
    // First check if there are any enrolled students or drivers
    const schoolDoc = await schoolsCollection.doc(schoolId).get();
    const schoolData = schoolDoc.data();
    
    if (schoolData.enrolledStudents > 0 || schoolData.enrolledDrivers > 0) {
      throw new Error('Cannot delete school with enrolled students or drivers');
    }
    
    await schoolsCollection.doc(schoolId).delete();
    return { success: true };
  } catch (error) {
    throw new Error(`Error deleting school: ${error.message}`);
  }
};

// Get all schools
const getAllSchools = async () => {
  try {
    const snapshot = await schoolsCollection.get();
    const schools = [];
    snapshot.forEach(doc => {
      schools.push({ id: doc.id, ...doc.data() });
    });
    return schools;
  } catch (error) {
    throw new Error(`Error getting all schools: ${error.message}`);
  }
};

// Get schools by location (within radius)
const getSchoolsByLocation = async (latitude, longitude, radiusInKm) => {
  try {
    const snapshot = await schoolsCollection.get();
    const schools = [];
    
    snapshot.forEach(doc => {
      const school = doc.data();
      const distance = calculateDistance(
        latitude,
        longitude,
        school.location.latitude,
        school.location.longitude
      );
      
      if (distance <= radiusInKm) {
        schools.push({ id: doc.id, ...school, distance });
      }
    });
    
    return schools.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    throw new Error(`Error getting schools by location: ${error.message}`);
  }
};

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const toRad = (value) => {
  return value * Math.PI / 180;
};

module.exports = {
  createSchool,
  getSchoolById,
  updateSchool,
  deleteSchool,
  getAllSchools,
  getSchoolsByLocation
}; 