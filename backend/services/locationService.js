const { realtimeDb, GOOGLE_MAPS_API_KEY, getCachedRoute, cacheRoute } = require('../config/firebase');
const { ref, set, get, push, remove, query, orderByChild, limitToLast } = require('firebase/database');
const axios = require('axios');

// Constants
const LOCATION_HISTORY_LIMIT = 100; // Keep last 100 location updates
const GEOFENCE_RADIUS = 100; // meters
const LOCATION_UPDATE_INTERVAL = 30000; // 30 seconds

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

// Update driver's real-time location
const updateDriverLocation = async (driverId, location) => {
  try {
    const locationRef = ref(realtimeDb, `locations/${driverId}`);
    const historyRef = ref(realtimeDb, `locationHistory/${driverId}`);
    
    // Add timestamp to location data
    const locationData = {
      ...location,
      timestamp: Date.now()
    };

    // Update current location
    await set(locationRef, locationData);

    // Add to history
    const historyEntry = push(historyRef);
    await set(historyEntry, locationData);

    // Clean up old history entries
    const historyQuery = query(historyRef, orderByChild('timestamp'), limitToLast(LOCATION_HISTORY_LIMIT));
    const snapshot = await get(historyQuery);
    const entries = snapshot.val() || {};
    
    // Remove entries beyond the limit
    const entriesToRemove = Object.entries(entries)
      .sort(([,a], [,b]) => a.timestamp - b.timestamp)
      .slice(0, -LOCATION_HISTORY_LIMIT)
      .map(([key]) => key);

    for (const key of entriesToRemove) {
      await remove(ref(realtimeDb, `locationHistory/${driverId}/${key}`));
    }

    return locationData;
  } catch (error) {
    console.error('Error updating driver location:', error);
    throw new Error('Failed to update driver location');
  }
};

// Get driver's current location
const getDriverLocation = async (driverId) => {
  try {
    const locationRef = ref(realtimeDb, `locations/${driverId}`);
    const snapshot = await get(locationRef);
    return snapshot.val();
  } catch (error) {
    console.error('Error getting driver location:', error);
    throw new Error('Failed to get driver location');
  }
};

// Get driver's location history
const getDriverLocationHistory = async (driverId, startTime, endTime) => {
  try {
    const historyRef = ref(realtimeDb, `locationHistory/${driverId}`);
    const historyQuery = query(
      historyRef,
      orderByChild('timestamp'),
      limitToLast(LOCATION_HISTORY_LIMIT)
    );
    
    const snapshot = await get(historyQuery);
    const history = snapshot.val() || {};
    
    return Object.values(history)
      .filter(entry => {
        const timestamp = entry.timestamp;
        return (!startTime || timestamp >= startTime) && 
               (!endTime || timestamp <= endTime);
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('Error getting driver location history:', error);
    throw new Error('Failed to get driver location history');
  }
};

// Calculate ETA and distance using Google Distance Matrix API
const calculateETA = async (origin, destination) => {
  try {
    const cacheKey = `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}`;
    const cached = getCachedRoute(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.status !== 'OK') {
      throw new Error('Failed to calculate ETA');
    }

    const result = {
      distance: response.data.rows[0].elements[0].distance,
      duration: response.data.rows[0].elements[0].duration,
      durationInTraffic: response.data.rows[0].elements[0].duration_in_traffic
    };

    cacheRoute(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error calculating ETA:', error);
    throw new Error('Failed to calculate ETA');
  }
};

// Check if location is within geofence
const isWithinGeofence = (location, center, radius = GEOFENCE_RADIUS) => {
  const distance = calculateDistance(
    location.lat,
    location.lng,
    center.lat,
    center.lng
  );
  return distance <= radius;
};

// Start journey tracking
const startJourneyTracking = async (journeyId, driverId, initialLocation) => {
  try {
    const journeyRef = ref(realtimeDb, `journeys/${journeyId}`);
    await set(journeyRef, {
      driverId,
      status: 'in-progress',
      startTime: Date.now(),
      currentLocation: initialLocation,
      geofences: [],
      lastUpdate: Date.now()
    });
    return true;
  } catch (error) {
    console.error('Error starting journey tracking:', error);
    throw new Error('Failed to start journey tracking');
  }
};

// End journey tracking
const endJourneyTracking = async (journeyId) => {
  try {
    const journeyRef = ref(realtimeDb, `journeys/${journeyId}`);
    const snapshot = await get(journeyRef);
    const journey = snapshot.val();

    if (!journey) {
      throw new Error('Journey not found');
    }

    await set(journeyRef, {
      ...journey,
      status: 'completed',
      endTime: Date.now()
    });

    // Clean up location history after 24 hours
    setTimeout(async () => {
      const historyRef = ref(realtimeDb, `locationHistory/${journey.driverId}`);
      await remove(historyRef);
    }, 24 * 60 * 60 * 1000);

    return true;
  } catch (error) {
    console.error('Error ending journey tracking:', error);
    throw new Error('Failed to end journey tracking');
  }
};

// Add geofence to journey
const addJourneyGeofence = async (journeyId, center, radius = GEOFENCE_RADIUS) => {
  try {
    const journeyRef = ref(realtimeDb, `journeys/${journeyId}`);
    const snapshot = await get(journeyRef);
    const journey = snapshot.val();

    if (!journey) {
      throw new Error('Journey not found');
    }

    const geofence = {
      center,
      radius,
      id: Date.now().toString()
    };

    await set(journeyRef, {
      ...journey,
      geofences: [...(journey.geofences || []), geofence]
    });

    return geofence;
  } catch (error) {
    console.error('Error adding journey geofence:', error);
    throw new Error('Failed to add journey geofence');
  }
};

// Check geofence status
const checkGeofenceStatus = async (journeyId, currentLocation) => {
  try {
    const journeyRef = ref(realtimeDb, `journeys/${journeyId}`);
    const snapshot = await get(journeyRef);
    const journey = snapshot.val();

    if (!journey || !journey.geofences) {
      return [];
    }

    return journey.geofences.map(geofence => ({
      ...geofence,
      isWithin: isWithinGeofence(currentLocation, geofence.center, geofence.radius)
    }));
  } catch (error) {
    console.error('Error checking geofence status:', error);
    throw new Error('Failed to check geofence status');
  }
};

module.exports = {
  updateDriverLocation,
  getDriverLocation,
  getDriverLocationHistory,
  calculateETA,
  startJourneyTracking,
  endJourneyTracking,
  addJourneyGeofence,
  checkGeofenceStatus,
  isWithinGeofence
}; 