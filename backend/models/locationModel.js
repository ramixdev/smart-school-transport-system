const { db } = require('../config/firebase');

const locationsCollection = db.collection('locations');

// Create new location record
const createLocationRecord = async (locationData) => {
  try {
    const locationRef = await locationsCollection.add({
      ...locationData,
      timestamp: new Date()
    });
    return { id: locationRef.id, ...locationData };
  } catch (error) {
    throw new Error(`Error creating location record: ${error.message}`);
  }
};

// Get latest location by vehicle ID
const getLatestLocationByVehicleId = async (vehicleId) => {
  try {
    const snapshot = await locationsCollection
      .where('vehicleId', '==', vehicleId)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    throw new Error(`Error getting latest location: ${error.message}`);
  }
};

// Get location history by vehicle ID
const getLocationHistoryByVehicleId = async (vehicleId, startTime, endTime) => {
  try {
    let query = locationsCollection
      .where('vehicleId', '==', vehicleId)
      .orderBy('timestamp', 'desc');
    
    if (startTime) {
      query = query.where('timestamp', '>=', startTime);
    }
    if (endTime) {
      query = query.where('timestamp', '<=', endTime);
    }
    
    const snapshot = await query.get();
    const locations = [];
    snapshot.forEach(doc => {
      locations.push({ id: doc.id, ...doc.data() });
    });
    return locations;
  } catch (error) {
    throw new Error(`Error getting location history: ${error.message}`);
  }
};

// Update vehicle status
const updateVehicleStatus = async (vehicleId, status) => {
  try {
    await locationsCollection.add({
      vehicleId,
      status,
      timestamp: new Date()
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Error updating vehicle status: ${error.message}`);
  }
};

// Get active vehicles
const getActiveVehicles = async () => {
  try {
    const snapshot = await locationsCollection
      .where('status', '==', 'active')
      .orderBy('timestamp', 'desc')
      .get();
    
    const vehicles = [];
    snapshot.forEach(doc => {
      vehicles.push({ id: doc.id, ...doc.data() });
    });
    return vehicles;
  } catch (error) {
    throw new Error(`Error getting active vehicles: ${error.message}`);
  }
};

module.exports = {
  createLocationRecord,
  getLatestLocationByVehicleId,
  getLocationHistoryByVehicleId,
  updateVehicleStatus,
  getActiveVehicles
}; 