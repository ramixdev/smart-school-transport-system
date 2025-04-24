const { db } = require('../config/firebase');

const routesCollection = db.collection('routes');

// Create new route
const createRoute = async (routeData) => {
  try {
    const routeRef = await routesCollection.add({
      ...routeData,
      createdAt: new Date(),
      status: 'active'
    });
    return { id: routeRef.id, ...routeData };
  } catch (error) {
    throw new Error(`Error creating route: ${error.message}`);
  }
};

// Get route by ID
const getRouteById = async (routeId) => {
  try {
    const routeDoc = await routesCollection.doc(routeId).get();
    if (!routeDoc.exists) {
      return null;
    }
    return { id: routeDoc.id, ...routeDoc.data() };
  } catch (error) {
    throw new Error(`Error getting route: ${error.message}`);
  }
};

// Update route
const updateRoute = async (routeId, routeData) => {
  try {
    await routesCollection.doc(routeId).update({
      ...routeData,
      updatedAt: new Date()
    });
    return { id: routeId, ...routeData };
  } catch (error) {
    throw new Error(`Error updating route: ${error.message}`);
  }
};

// Delete route
const deleteRoute = async (routeId) => {
  try {
    await routesCollection.doc(routeId).delete();
    return { success: true };
  } catch (error) {
    throw new Error(`Error deleting route: ${error.message}`);
  }
};

// Get routes by school ID
const getRoutesBySchoolId = async (schoolId) => {
  try {
    const snapshot = await routesCollection.where('schoolId', '==', schoolId).get();
    const routes = [];
    snapshot.forEach(doc => {
      routes.push({ id: doc.id, ...doc.data() });
    });
    return routes;
  } catch (error) {
    throw new Error(`Error getting routes by school: ${error.message}`);
  }
};

// Get routes by driver ID
const getRoutesByDriverId = async (driverId) => {
  try {
    const snapshot = await routesCollection.where('driverId', '==', driverId).get();
    const routes = [];
    snapshot.forEach(doc => {
      routes.push({ id: doc.id, ...doc.data() });
    });
    return routes;
  } catch (error) {
    throw new Error(`Error getting routes by driver: ${error.message}`);
  }
};

// Add stop to route
const addStopToRoute = async (routeId, stopData) => {
  try {
    await routesCollection.doc(routeId).update({
      'stops': db.FieldValue.arrayUnion({
        ...stopData,
        createdAt: new Date()
      })
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Error adding stop to route: ${error.message}`);
  }
};

// Remove stop from route
const removeStopFromRoute = async (routeId, stopId) => {
  try {
    const routeDoc = await routesCollection.doc(routeId).get();
    const routeData = routeDoc.data();
    const updatedStops = routeData.stops.filter(stop => stop.id !== stopId);
    
    await routesCollection.doc(routeId).update({
      stops: updatedStops
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Error removing stop from route: ${error.message}`);
  }
};

// Update route schedule
const updateRouteSchedule = async (routeId, scheduleData) => {
  try {
    await routesCollection.doc(routeId).update({
      schedule: scheduleData,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Error updating route schedule: ${error.message}`);
  }
};

module.exports = {
  createRoute,
  getRouteById,
  updateRoute,
  deleteRoute,
  getRoutesBySchoolId,
  getRoutesByDriverId,
  addStopToRoute,
  removeStopFromRoute,
  updateRouteSchedule
}; 