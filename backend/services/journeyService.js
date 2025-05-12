const { db } = require('../config/firebase');
const { createError, ErrorCodes } = require('../utils/errors');
const { validateLocation } = require('../utils/validation');

// Create a new journey
const createJourney = async (driverId, type, date) => {
  try {
    // Get all enrolled children for the driver
    const childrenSnapshot = await db.collection('children')
      .where('driver', '==', driverId)
      .get();

    // Get absent children for the day
    const absencesSnapshot = await db.collection('absences')
      .where('date', '==', date.toISOString().split('T')[0])
      .where('childId', 'in', childrenSnapshot.docs.map(doc => doc.id))
      .get();

    const absentChildIds = new Set(absencesSnapshot.docs.map(doc => doc.data().childId));

    // Filter out absent children
    const presentChildren = [];
    for (const doc of childrenSnapshot.docs) {
      if (!absentChildIds.has(doc.id)) {
        presentChildren.push({ id: doc.id, ...doc.data() });
      }
    }

    // Generate route based on type and present children
    const route = await generateRoute(driverId, presentChildren, type);

    const journeyRef = await db.collection('journeys').add({
      driverId,
      type,
      date,
      route,
      status: 'scheduled',
      children: presentChildren.map(child => ({
        id: child.id,
        name: child.name,
        status: 'pending'
      })),
      startTime: null,
      endTime: null,
      createdAt: new Date()
    });

    return { id: journeyRef.id, route };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error creating journey: ${error.message}`);
  }
};

// Generate optimized route
const generateRoute = async (driverId, children, type) => {
  try {
    const driverDoc = await db.collection('drivers').doc(driverId).get();
    const startLocation = driverDoc.data().vehicle.startLocation;

    let stops = [];
    if (type === 'morning') {
      // Morning: Home -> Children's homes (parent location) -> Schools
      const schools = new Map();
      // Group children by school and fetch parent locations
      const parentLocations = {};
      for (const child of children) {
        // Fetch parent location
        if (!parentLocations[child.parentId]) {
          const parentDoc = await db.collection('users').doc(child.parentId).get();
          parentLocations[child.parentId] = parentDoc.data().location;
        }
        // Fetch school location
        if (!schools.has(child.school)) {
          const schoolDoc = await db.collection('schools').doc(child.school).get();
          schools.set(child.school, {
            location: schoolDoc.data().location,
            children: []
          });
        }
        schools.get(child.school).children.push(child);
      }
      // Add children's pickup locations (parent location)
      stops = children.map(child => ({
        type: 'pickup',
        childId: child.id,
        location: parentLocations[child.parentId],
        name: child.name
      }));
      // Add school dropoff locations
      for (const [schoolId, school] of schools) {
        stops.push({
          type: 'school_dropoff',
          schoolId,
          location: school.location,
          children: school.children.map(c => c.id)
        });
      }
    } else if (type === 'evening') {
      // Evening: Schools -> Children's homes (parent location)
      const schools = new Map();
      const parentLocations = {};
      for (const child of children) {
        // Fetch parent location
        if (!parentLocations[child.parentId]) {
          const parentDoc = await db.collection('users').doc(child.parentId).get();
          parentLocations[child.parentId] = parentDoc.data().location;
        }
        // Fetch school location
        if (!schools.has(child.school)) {
          const schoolDoc = await db.collection('schools').doc(child.school).get();
          schools.set(child.school, {
            location: schoolDoc.data().location,
            children: []
          });
        }
        schools.get(child.school).children.push(child);
      }
      // Add school pickup locations
      for (const [schoolId, school] of schools) {
        stops.push({
          type: 'school_pickup',
          schoolId,
          location: school.location,
          children: school.children.map(c => c.id)
        });
      }
      // Add children's dropoff locations (parent location)
      stops = stops.concat(children.map(child => ({
        type: 'dropoff',
        childId: child.id,
        location: parentLocations[child.parentId],
        name: child.name
      })));
    }
    // Optimize route using simple nearest neighbor algorithm
    const optimizedStops = optimizeRoute(startLocation, stops);
    return {
      startLocation,
      stops: optimizedStops
    };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error generating route: ${error.message}`);
  }
};

// Simple nearest neighbor route optimization
const optimizeRoute = (startLocation, stops) => {
  const optimizedStops = [];
  let currentLocation = startLocation;
  const remainingStops = [...stops];

  while (remainingStops.length > 0) {
    let nearestIndex = 0;
    let minDistance = calculateDistance(
      currentLocation,
      remainingStops[0].location
    );

    for (let i = 1; i < remainingStops.length; i++) {
      const distance = calculateDistance(
        currentLocation,
        remainingStops[i].location
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    const nextStop = remainingStops.splice(nearestIndex, 1)[0];
    optimizedStops.push({
      ...nextStop,
      estimatedDistance: minDistance
    });
    currentLocation = nextStop.location;
  }

  return optimizedStops;
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in km
  const lat1 = point1.latitude;
  const lon1 = point1.longitude;
  const lat2 = point2.latitude;
  const lon2 = point2.longitude;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Start journey
const startJourney = async (journeyId) => {
  try {
    const journeyDoc = await db.collection('journeys').doc(journeyId).get();
    if (!journeyDoc.exists) {
      throw createError(ErrorCodes.NOT_FOUND, 'Journey not found');
    }

    if (journeyDoc.data().status !== 'scheduled') {
      throw createError(ErrorCodes.INVALID_STATUS, 'Journey is not in scheduled status');
    }

    await journeyDoc.ref.update({
      status: 'in_progress',
      startTime: new Date()
    });

    return { success: true };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error starting journey: ${error.message}`);
  }
};

// End journey
const endJourney = async (journeyId) => {
  try {
    const journeyDoc = await db.collection('journeys').doc(journeyId).get();
    if (!journeyDoc.exists) {
      throw createError(ErrorCodes.NOT_FOUND, 'Journey not found');
    }

    if (journeyDoc.data().status !== 'in_progress') {
      throw createError(ErrorCodes.INVALID_STATUS, 'Journey is not in progress');
    }

    await journeyDoc.ref.update({
      status: 'completed',
      endTime: new Date()
    });

    return { success: true };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error ending journey: ${error.message}`);
  }
};

// Update child status in journey
const updateChildStatus = async (journeyId, childId, status, location) => {
  try {
    if (!validateLocation(location)) {
      throw createError(ErrorCodes.VALIDATION_ERROR, 'Invalid location data');
    }

    const journeyDoc = await db.collection('journeys').doc(journeyId).get();
    if (!journeyDoc.exists) {
      throw createError(ErrorCodes.NOT_FOUND, 'Journey not found');
    }

    const journey = journeyDoc.data();
    const childIndex = journey.children.findIndex(c => c.id === childId);
    if (childIndex === -1) {
      throw createError(ErrorCodes.NOT_FOUND, 'Child not found in journey');
    }

    journey.children[childIndex].status = status;
    journey.children[childIndex].statusUpdatedAt = new Date();
    journey.children[childIndex].location = location;

    await journeyDoc.ref.update({
      children: journey.children
    });

    return { success: true };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error updating child status: ${error.message}`);
  }
};

// Get active journey for driver
const getActiveJourney = async (driverId) => {
  try {
    const snapshot = await db.collection('journeys')
      .where('driverId', '==', driverId)
      .where('status', '==', 'in_progress')
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error getting active journey: ${error.message}`);
  }
};

// Get journey by ID
const getJourneyById = async (journeyId) => {
  try {
    const journeyDoc = await db.collection('journeys').doc(journeyId).get();
    if (!journeyDoc.exists) {
      throw createError(ErrorCodes.NOT_FOUND, 'Journey not found');
    }

    return { id: journeyDoc.id, ...journeyDoc.data() };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error getting journey: ${error.message}`);
  }
};

module.exports = {
  createJourney,
  startJourney,
  endJourney,
  updateChildStatus,
  getActiveJourney,
  getJourneyById
}; 