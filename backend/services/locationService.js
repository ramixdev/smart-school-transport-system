const { db, realtimeDb } = require('../config/firebase');
const { validateLocation } = require('../utils/validation');
const { createError, ErrorCodes } = require('../utils/errors');

// Update driver's real-time location
const updateDriverLocation = async (driverId, location) => {
  try {
    if (!validateLocation(location)) {
      throw createError(ErrorCodes.VALIDATION_ERROR, 'Invalid location data');
    }

    await realtimeDb.ref(`driver_locations/${driverId}`).set({
      location,
      timestamp: Date.now(),
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error updating driver location: ${error.message}`);
  }
};

// Get driver's current location
const getDriverLocation = async (driverId) => {
  try {
    const snapshot = await realtimeDb.ref(`driver_locations/${driverId}`).once('value');
    if (!snapshot.exists()) {
      throw createError(ErrorCodes.NOT_FOUND, 'Driver location not found');
    }
    return snapshot.val();
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error getting driver location: ${error.message}`);
  }
};

// Calculate ETA and distance to destination
const calculateETAAndDistance = async (driverId, destinationLocation) => {
  try {
    if (!validateLocation(destinationLocation)) {
      throw createError(ErrorCodes.VALIDATION_ERROR, 'Invalid destination location');
    }

    const currentLocation = await getDriverLocation(driverId);
    if (!currentLocation) {
      throw createError(ErrorCodes.NOT_FOUND, 'Current location not found');
    }

    // Calculate distance using Haversine formula
    const R = 6371; // Earth's radius in km
    const lat1 = currentLocation.location.latitude;
    const lon1 = currentLocation.location.longitude;
    const lat2 = destinationLocation.latitude;
    const lon2 = destinationLocation.longitude;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    // Estimate ETA (assuming average speed of 40 km/h)
    const averageSpeed = 40; // km/h
    const eta = (distance / averageSpeed) * 60; // minutes

    return {
      distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
      eta: Math.ceil(eta), // Round up to nearest minute
      unit: 'km',
      currentLocation: currentLocation.location,
      lastUpdated: currentLocation.timestamp
    };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error calculating ETA: ${error.message}`);
  }
};

// Start journey tracking
const startJourneyTracking = async (journeyId, driverId) => {
  try {
    await realtimeDb.ref(`active_journeys/${journeyId}`).set({
      driverId,
      startTime: Date.now(),
      status: 'in_progress'
    });

    // Set up location tracking interval in the client side
    return { success: true, journeyId };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error starting journey tracking: ${error.message}`);
  }
};

// End journey tracking
const endJourneyTracking = async (journeyId) => {
  try {
    const journeyRef = realtimeDb.ref(`active_journeys/${journeyId}`);
    const snapshot = await journeyRef.once('value');
    
    if (!snapshot.exists()) {
      throw createError(ErrorCodes.NOT_FOUND, 'Journey not found');
    }

    const journeyData = snapshot.val();
    
    // Store journey history
    await realtimeDb.ref(`journey_history/${journeyId}`).set({
      ...journeyData,
      endTime: Date.now(),
      status: 'completed'
    });

    // Remove from active journeys
    await journeyRef.remove();

    return { success: true };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error ending journey tracking: ${error.message}`);
  }
};

// Get active journey status
const getJourneyStatus = async (journeyId) => {
  try {
    const snapshot = await realtimeDb.ref(`active_journeys/${journeyId}`).once('value');
    if (!snapshot.exists()) {
      // Check history
      const historySnapshot = await realtimeDb.ref(`journey_history/${journeyId}`).once('value');
      if (!historySnapshot.exists()) {
        throw createError(ErrorCodes.NOT_FOUND, 'Journey not found');
      }
      return historySnapshot.val();
    }
    return snapshot.val();
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error getting journey status: ${error.message}`);
  }
};

module.exports = {
  updateDriverLocation,
  getDriverLocation,
  calculateETAAndDistance,
  startJourneyTracking,
  endJourneyTracking,
  getJourneyStatus
}; 