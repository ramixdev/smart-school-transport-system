const { db } = require('../config/firebase');

const driversCollection = db.collection('drivers');

// Create driver profile
const createDriver = async (userId, driverData) => {
  try {
    await driversCollection.doc(userId).set(driverData, { merge: true });
    return { id: userId, ...driverData };
  } catch (error) {
    throw new Error(`Error creating driver: ${error.message}`);
  }
};

// Get driver by ID
const getDriverById = async (driverId) => {
  try {
    const driverDoc = await driversCollection.doc(driverId).get();
    if (!driverDoc.exists) {
      return null;
    }
    return { id: driverDoc.id, ...driverDoc.data() };
  } catch (error) {
    throw new Error(`Error getting driver: ${error.message}`);
  }
};

// Update driver profile
const updateDriver = async (driverId, driverData) => {
  try {
    await driversCollection.doc(driverId).update(driverData);
    return { id: driverId, ...driverData };
  } catch (error) {
    throw new Error(`Error updating driver: ${error.message}`);
  }
};

// Delete driver profile
const deleteDriver = async (driverId) => {
  try {
    await driversCollection.doc(driverId).delete();
    return { success: true };
  } catch (error) {
    throw new Error(`Error deleting driver: ${error.message}`);
  }
};

// Get all drivers
const getAllDrivers = async () => {
  try {
    const snapshot = await driversCollection.get();
    const drivers = [];
    snapshot.forEach(doc => {
      drivers.push({ id: doc.id, ...doc.data() });
    });
    return drivers;
  } catch (error) {
    throw new Error(`Error getting all drivers: ${error.message}`);
  }
};

// Get drivers by school
const getDriversBySchool = async (schoolId) => {
  try {
    const snapshot = await driversCollection.where('schools', 'array-contains', schoolId).get();
    const drivers = [];
    snapshot.forEach(doc => {
      drivers.push({ id: doc.id, ...doc.data() });
    });
    return drivers;
  } catch (error) {
    throw new Error(`Error getting drivers by school: ${error.message}`);
  }
};

// Add school to driver's schools
const addSchoolToDriver = async (driverId, schoolId) => {
  try {
    await driversCollection.doc(driverId).update({
      schools: db.FieldValue.arrayUnion(schoolId)
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Error adding school to driver: ${error.message}`);
  }
};

// Remove school from driver's schools
const removeSchoolFromDriver = async (driverId, schoolId) => {
  try {
    await driversCollection.doc(driverId).update({
      schools: db.FieldValue.arrayRemove(schoolId)
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Error removing school from driver: ${error.message}`);
  }
};

// Update vehicle details
const updateVehicleDetails = async (driverId, vehicleData) => {
  try {
    await driversCollection.doc(driverId).update({
      vehicle: vehicleData
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Error updating vehicle details: ${error.message}`);
  }
};

module.exports = {
  createDriver,
  getDriverById,
  updateDriver,
  deleteDriver,
  getAllDrivers,
  getDriversBySchool,
  addSchoolToDriver,
  removeSchoolFromDriver,
  updateVehicleDetails
}; 