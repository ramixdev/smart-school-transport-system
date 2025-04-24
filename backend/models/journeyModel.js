const { db } = require('../config/firebase');

const journeysCollection = db.collection('journeys');

// Create new journey
const createJourney = async (journeyData) => {
  try {
    const journeyRef = await journeysCollection.add({
      ...journeyData,
      createdAt: new Date(),
      status: 'scheduled'
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
    await journeysCollection.doc(journeyId).update({
      status: 'in-progress',
      startTime: new Date(),
      currentLocation: startLocation,
      stops: [], // Will be populated as driver makes stops
      route: [] // Will be populated with route coordinates
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Error starting journey: ${error.message}`);
  }
};

// End journey
const endJourney = async (journeyId) => {
  try {
    await journeysCollection.doc(journeyId).update({
      status: 'completed',
      endTime: new Date()
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
    await journeyRef.update({
      currentLocation: location,
      'route': db.FieldValue.arrayUnion(location) // Append to route array
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Error updating journey location: ${error.message}`);
  }
};

// Add stop to journey
const addStopToJourney = async (journeyId, stopData) => {
  try {
    await journeysCollection.doc(journeyId).update({
      'stops': db.FieldValue.arrayUnion({
        ...stopData,
        timestamp: new Date()
      })
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Error adding stop to journey: ${error.message}`);
  }
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