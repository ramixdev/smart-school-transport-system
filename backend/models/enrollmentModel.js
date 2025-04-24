const { db } = require('../config/firebase');

const enrollmentsCollection = db.collection('enrollments');

// Create enrollment request
const createEnrollmentRequest = async (enrollmentData) => {
  try {
    const enrollmentRef = await enrollmentsCollection.add({
      ...enrollmentData,
      status: 'pending',
      createdAt: new Date()
    });
    return { id: enrollmentRef.id, ...enrollmentData };
  } catch (error) {
    throw new Error(`Error creating enrollment request: ${error.message}`);
  }
};

// Get enrollment by ID
const getEnrollmentById = async (enrollmentId) => {
  try {
    const enrollmentDoc = await enrollmentsCollection.doc(enrollmentId).get();
    if (!enrollmentDoc.exists) {
      return null;
    }
    return { id: enrollmentDoc.id, ...enrollmentDoc.data() };
  } catch (error) {
    throw new Error(`Error getting enrollment: ${error.message}`);
  }
};

// Update enrollment status
const updateEnrollmentStatus = async (enrollmentId, status, notes = '') => {
  try {
    await enrollmentsCollection.doc(enrollmentId).update({
      status,
      updatedAt: new Date(),
      notes
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Error updating enrollment status: ${error.message}`);
  }
};

// Get pending enrollments by driver ID
const getPendingEnrollmentsByDriverId = async (driverId) => {
  try {
    const snapshot = await enrollmentsCollection
      .where('driverId', '==', driverId)
      .where('status', '==', 'pending')
      .get();
    
    const enrollments = [];
    snapshot.forEach(doc => {
      enrollments.push({ id: doc.id, ...doc.data() });
    });
    return enrollments;
  } catch (error) {
    throw new Error(`Error getting pending enrollments: ${error.message}`);
  }
};

// Get enrollments by parent ID
const getEnrollmentsByParentId = async (parentId) => {
  try {
    const snapshot = await enrollmentsCollection
      .where('parentId', '==', parentId)
      .get();
    
    const enrollments = [];
    snapshot.forEach(doc => {
      enrollments.push({ id: doc.id, ...doc.data() });
    });
    return enrollments;
  } catch (error) {
    throw new Error(`Error getting enrollments by parent: ${error.message}`);
  }
};

// Delete enrollment
const deleteEnrollment = async (enrollmentId) => {
  try {
    await enrollmentsCollection.doc(enrollmentId).delete();
    return { success: true };
  } catch (error) {
    throw new Error(`Error deleting enrollment: ${error.message}`);
  }
};

module.exports = {
  createEnrollmentRequest,
  getEnrollmentById,
  updateEnrollmentStatus,
  getPendingEnrollmentsByDriverId,
  getEnrollmentsByParentId,
  deleteEnrollment
}; 