const { db } = require('../config/firebase');

const vehiclesCollection = db.collection('vehicles');

// Create new vehicle
const createVehicle = async (vehicleData) => {
  try {
    const vehicleRef = await vehiclesCollection.add({
      ...vehicleData,
      createdAt: new Date(),
      status: 'active'
    });
    return { id: vehicleRef.id, ...vehicleData };
  } catch (error) {
    throw new Error(`Error creating vehicle: ${error.message}`);
  }
};

// Get vehicle by ID
const getVehicleById = async (vehicleId) => {
  try {
    const vehicleDoc = await vehiclesCollection.doc(vehicleId).get();
    if (!vehicleDoc.exists) {
      return null;
    }
    return { id: vehicleDoc.id, ...vehicleDoc.data() };
  } catch (error) {
    throw new Error(`Error getting vehicle: ${error.message}`);
  }
};

// Update vehicle
const updateVehicle = async (vehicleId, vehicleData) => {
  try {
    await vehiclesCollection.doc(vehicleId).update({
      ...vehicleData,
      updatedAt: new Date()
    });
    return { id: vehicleId, ...vehicleData };
  } catch (error) {
    throw new Error(`Error updating vehicle: ${error.message}`);
  }
};

// Delete vehicle
const deleteVehicle = async (vehicleId) => {
  try {
    await vehiclesCollection.doc(vehicleId).delete();
    return { success: true };
  } catch (error) {
    throw new Error(`Error deleting vehicle: ${error.message}`);
  }
};

// Get vehicles by school ID
const getVehiclesBySchoolId = async (schoolId) => {
  try {
    const snapshot = await vehiclesCollection.where('schoolId', '==', schoolId).get();
    const vehicles = [];
    snapshot.forEach(doc => {
      vehicles.push({ id: doc.id, ...doc.data() });
    });
    return vehicles;
  } catch (error) {
    throw new Error(`Error getting vehicles by school: ${error.message}`);
  }
};

// Add maintenance record
const addMaintenanceRecord = async (vehicleId, maintenanceData) => {
  try {
    await vehiclesCollection.doc(vehicleId).update({
      'maintenanceRecords': db.FieldValue.arrayUnion({
        ...maintenanceData,
        createdAt: new Date()
      })
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Error adding maintenance record: ${error.message}`);
  }
};

// Update vehicle status
const updateVehicleStatus = async (vehicleId, status) => {
  try {
    await vehiclesCollection.doc(vehicleId).update({
      status,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Error updating vehicle status: ${error.message}`);
  }
};

module.exports = {
  createVehicle,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getVehiclesBySchoolId,
  addMaintenanceRecord,
  updateVehicleStatus
}; 