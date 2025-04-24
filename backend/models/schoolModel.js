const { db } = require('../config/firebase');

const schoolsCollection = db.collection('schools');

// Create new school
const createSchool = async (schoolData) => {
  try {
    const schoolRef = await schoolsCollection.add(schoolData);
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
    await schoolsCollection.doc(schoolId).update(schoolData);
    return { id: schoolId, ...schoolData };
  } catch (error) {
    throw new Error(`Error updating school: ${error.message}`);
  }
};

// Delete school
const deleteSchool = async (schoolId) => {
  try {
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

module.exports = {
  createSchool,
  getSchoolById,
  updateSchool,
  deleteSchool,
  getAllSchools
}; 