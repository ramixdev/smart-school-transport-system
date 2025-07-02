const { db } = require('../config/firebase');

const journeysCollection = db.collection('journeys');

// Create new journey
const createJourney = async (journeyData) => {
  try {
    const journeyRef = await journeysCollection.add({
      ...journeyData,
      createdAt: new Date(),
      status: 'scheduled',
      journeyType: journeyData.journeyType, // 'morning' or 'evening'
      date: journeyData.date || new Date().toISOString().split('T')[0],
      stops: [],
      route: [],
      notifications: [],
      estimatedDuration: 0,
      actualDuration: 0,
      distance: 0
    });
    return { id: journeyRef.id, ...journeyData };
  } catch (error) {
    throw new Error(`Error creating journey: ${error.message}`);
  }
};

// Get journey by ID
const getJourneyById = async (journeyId) => {
  try {
    const journeyDoc = await journeysCollection.doc(journeyId).get();
    if (!journeyDoc.exists) {
      return null;
    }
    return { id: journeyDoc.id, ...journeyDoc.data() };
  } catch (error) {
    throw new Error(`Error getting journey: ${error.message}`);
  }
};

// Update journey
const updateJourney = async (journeyId, journeyData) => {
  try {
    await journeysCollection.doc(journeyId).update({
      ...journeyData,
      updatedAt: new Date()
    });
    return { id: journeyId, ...journeyData };
  } catch (error) {
    throw new Error(`Error updating journey: ${error.message}`);
  }
};

// Delete journey
const deleteJourney = async (journeyId) => {
  try {
    await journeysCollection.doc(journeyId).delete();
    return { success: true };
  } catch (error) {
    throw new Error(`Error deleting journey: ${error.message}`);
  }
};

// Get journeys by driver ID and date
const getJourneysByDriverAndDate = async (driverId, date, journeyType) => {
  try {
    const formattedDate = date || new Date().toISOString().split('T')[0];
    let query = journeysCollection
      .where('driverId', '==', driverId)
      .where('date', '==', formattedDate);
    
    if (journeyType) {
      query = query.where('journeyType', '==', journeyType);
    }
    
    const snapshot = await query.get();
    const journeys = [];
    snapshot.forEach(doc => {
      journeys.push({ id: doc.id, ...doc.data() });
    });
    return journeys;
  } catch (error) {
    throw new Error(`Error getting journeys by driver and date: ${error.message}`);
  }
};

// Start journey
const startJourney = async (journeyId, startLocation) => {
  try {
    const journeyRef = journeysCollection.doc(journeyId);
    const journeyDoc = await journeyRef.get();
    const journeyData = journeyDoc.data();

    // Calculate initial route based on journey type
    const route = await calculateInitialRoute(journeyData);
    
    await journeyRef.update({
      status: 'in-progress',
      startTime: new Date(),
      currentLocation: startLocation,
      route: route,
      stops: [],
      notifications: []
    });
    return { success: true, route };
  } catch (error) {
    throw new Error(`Error starting journey: ${error.message}`);
  }
};

// End journey
const endJourney = async (journeyId) => {
  try {
    const journeyRef = journeysCollection.doc(journeyId);
    const journeyDoc = await journeyRef.get();
    const journeyData = journeyDoc.data();
    
    const endTime = new Date();
    const duration = (endTime - journeyData.startTime) / 1000 / 60; // in minutes
    
    await journeyRef.update({
      status: 'completed',
      endTime: endTime,
      actualDuration: duration
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Error ending journey: ${error.message}`);
  }
};

// Update journey location
const updateJourneyLocation = async (journeyId, location) => {
  try {
    const journeyRef = journeysCollection.doc(journeyId);
    const journeyDoc = await journeyRef.get();
    const journeyData = journeyDoc.data();
    
    // Add location to route
    await journeyRef.update({
      currentLocation: location,
      'route': db.FieldValue.arrayUnion(location)
    });
    
    // Check if we've reached any stops
    const reachedStops = checkReachedStops(journeyData.stops, location);
    if (reachedStops.length > 0) {
      await handleReachedStops(journeyId, reachedStops, journeyData);
    }
    
    return { success: true, reachedStops };
  } catch (error) {
    throw new Error(`Error updating journey location: ${error.message}`);
  }
};

// Add stop to journey
const addStopToJourney = async (journeyId, stopData) => {
  try {
    const stop = {
      ...stopData,
      timestamp: new Date(),
      status: 'pending',
      notifications: []
    };
    
    await journeysCollection.doc(journeyId).update({
      'stops': db.FieldValue.arrayUnion(stop)
    });
    
    // Recalculate route with new stop
    await recalculateRoute(journeyId);
    
    return { success: true };
  } catch (error) {
    throw new Error(`Error adding stop to journey: ${error.message}`);
  }
};

// Helper function to calculate initial route
const calculateInitialRoute = async (journeyData) => {
  // This would integrate with a mapping service like Google Maps
  // to calculate the optimal route based on journey type
  return [];
};

// Helper function to check reached stops
const checkReachedStops = (stops, currentLocation) => {
  return stops.filter(stop => {
    if (stop.status === 'completed') return false;
    
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      stop.location.latitude,
      stop.location.longitude
    );
    
    return distance <= 0.1; // Within 100 meters
  });
};

// Helper function to handle reached stops
const handleReachedStops = async (journeyId, reachedStops, journeyData) => {
  const journeyRef = journeysCollection.doc(journeyId);
  
  for (const stop of reachedStops) {
    // Update stop status
    await journeyRef.update({
      [`stops.${stop.index}.status`]: 'completed',
      [`stops.${stop.index}.completedAt`]: new Date()
    });
    
    // Send notifications based on journey type
    if (journeyData.journeyType === 'morning') {
      // Notify parents when child is dropped at school
      await sendSchoolArrivalNotification(stop);
    } else {
      // Notify parents when child is picked up from school
      await sendSchoolPickupNotification(stop);
    }
  }
};

// Helper function to recalculate route
const recalculateRoute = async (journeyId) => {
  // This would integrate with a mapping service to recalculate
  // the optimal route based on current location and remaining stops
};

// Helper function to calculate distance
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
  createJourney,
  getJourneyById,
  updateJourney,
  deleteJourney,
  getJourneysByDriverAndDate,
  startJourney,
  endJourney,
  updateJourneyLocation,
  addStopToJourney
}; 