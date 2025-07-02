const { db } = require('../config/firebase');
const { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } = require('firebase/firestore');
const axios = require('axios');
const { GOOGLE_MAPS_API_KEY, getCachedRoute, cacheRoute } = require('../config/firebase');

// Constants
const OPTIMIZATION_ALGORITHMS = {
  NEAREST_NEIGHBOR: 'nearest_neighbor',
  GENETIC: 'genetic',
  SIMULATED_ANNEALING: 'simulated_annealing'
};

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

// Nearest Neighbor Algorithm
const nearestNeighborAlgorithm = (stops, startPoint) => {
  const route = [startPoint];
  const unvisited = [...stops];

  while (unvisited.length > 0) {
    const current = route[route.length - 1];
    let nearest = unvisited[0];
    let minDistance = calculateDistance(
      current.lat,
      current.lng,
      nearest.lat,
      nearest.lng
    );

    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateDistance(
        current.lat,
        current.lng,
        unvisited[i].lat,
        unvisited[i].lng
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = unvisited[i];
      }
    }

    route.push(nearest);
    unvisited.splice(unvisited.indexOf(nearest), 1);
  }

  return route;
};

// Genetic Algorithm
const geneticAlgorithm = (stops, startPoint, populationSize = 50, generations = 100) => {
  // Initialize population
  let population = Array(populationSize).fill().map(() => {
    const route = [startPoint, ...stops];
    for (let i = route.length - 1; i > 1; i--) {
      const j = Math.floor(Math.random() * (i - 1)) + 1;
      [route[i], route[j]] = [route[j], route[i]];
    }
    return route;
  });

  // Fitness function
  const calculateFitness = (route) => {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalDistance += calculateDistance(
        route[i].lat,
        route[i].lng,
        route[i + 1].lat,
        route[i + 1].lng
      );
    }
    return 1 / totalDistance;
  };

  // Selection
  const selectParent = (population) => {
    const fitnesses = population.map(calculateFitness);
    const totalFitness = fitnesses.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalFitness;
    for (let i = 0; i < population.length; i++) {
      random -= fitnesses[i];
      if (random <= 0) return population[i];
    }
    return population[population.length - 1];
  };

  // Crossover
  const crossover = (parent1, parent2) => {
    const child = [startPoint];
    const remaining = parent1.slice(1);
    const used = new Set([startPoint]);

    while (child.length < parent1.length) {
      const current = child[child.length - 1];
      let next = null;
      let minDistance = Infinity;

      for (const stop of remaining) {
        if (!used.has(stop)) {
          const distance = calculateDistance(
            current.lat,
            current.lng,
            stop.lat,
            stop.lng
          );
          if (distance < minDistance) {
            minDistance = distance;
            next = stop;
          }
        }
      }

      if (next) {
        child.push(next);
        used.add(next);
      }
    }

    return child;
  };

  // Mutation
  const mutate = (route) => {
    if (Math.random() < 0.1) {
      const i = Math.floor(Math.random() * (route.length - 2)) + 1;
      const j = Math.floor(Math.random() * (route.length - 2)) + 1;
      [route[i], route[j]] = [route[j], route[i]];
    }
    return route;
  };

  // Evolution
  for (let generation = 0; generation < generations; generation++) {
    const newPopulation = [];
    for (let i = 0; i < populationSize; i++) {
      const parent1 = selectParent(population);
      const parent2 = selectParent(population);
      let child = crossover(parent1, parent2);
      child = mutate(child);
      newPopulation.push(child);
    }
    population = newPopulation;
  }

  // Return best route
  return population.reduce((best, current) => {
    return calculateFitness(current) > calculateFitness(best) ? current : best;
  });
};

// Simulated Annealing Algorithm
const simulatedAnnealingAlgorithm = (stops, startPoint, initialTemp = 100, coolingRate = 0.95) => {
  let currentRoute = [startPoint, ...stops];
  let bestRoute = [...currentRoute];
  let currentDistance = calculateTotalDistance(currentRoute);
  let bestDistance = currentDistance;
  let temperature = initialTemp;

  while (temperature > 1) {
    // Generate new route by swapping two random stops
    const newRoute = [...currentRoute];
    const i = Math.floor(Math.random() * (newRoute.length - 2)) + 1;
    const j = Math.floor(Math.random() * (newRoute.length - 2)) + 1;
    [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];

    const newDistance = calculateTotalDistance(newRoute);
    const delta = newDistance - currentDistance;

    // Accept new route if it's better or based on probability
    if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
      currentRoute = newRoute;
      currentDistance = newDistance;

      if (currentDistance < bestDistance) {
        bestRoute = [...currentRoute];
        bestDistance = currentDistance;
      }
    }

    temperature *= coolingRate;
  }

  return bestRoute;
};

// Calculate total distance of a route
const calculateTotalDistance = (route) => {
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += calculateDistance(
      route[i].lat,
      route[i].lng,
      route[i + 1].lat,
      route[i + 1].lng
    );
  }
  return totalDistance;
};

// Optimize route using Google Maps API
const optimizeRouteWithGoogleMaps = async (stops, startPoint) => {
  try {
    const cacheKey = JSON.stringify([startPoint, ...stops]);
    const cached = getCachedRoute(cacheKey);
    if (cached) {
      return cached;
    }

    const waypoints = stops.map(stop => `${stop.lat},${stop.lng}`).join('|');
    const origin = `${startPoint.lat},${startPoint.lng}`;
    const destination = origin; // Return to start point

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=optimize:true|${waypoints}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.status !== 'OK') {
      throw new Error('Failed to optimize route');
    }

    const optimizedRoute = response.data.routes[0];
    const result = {
      route: optimizedRoute.legs.map(leg => ({
        start: leg.start_location,
        end: leg.end_location,
        distance: leg.distance,
        duration: leg.duration,
        durationInTraffic: leg.duration_in_traffic
      })),
      totalDistance: optimizedRoute.legs.reduce((sum, leg) => sum + leg.distance.value, 0),
      totalDuration: optimizedRoute.legs.reduce((sum, leg) => sum + leg.duration.value, 0),
      waypointOrder: optimizedRoute.waypoint_order
    };

    cacheRoute(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error optimizing route with Google Maps:', error);
    throw new Error('Failed to optimize route with Google Maps');
  }
};

// Create journey
const createJourney = async (journeyData) => {
  try {
    const journeyRef = collection(db, 'journeys');
    const journey = {
      ...journeyData,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const docRef = await addDoc(journeyRef, journey);
    return { id: docRef.id, ...journey };
  } catch (error) {
    console.error('Error creating journey:', error);
    throw new Error('Failed to create journey');
  }
};

// Optimize journey route
const optimizeJourneyRoute = async (journeyId, algorithm = OPTIMIZATION_ALGORITHMS.GENETIC) => {
  try {
    const journeyRef = doc(db, 'journeys', journeyId);
    const journeyDoc = await getDocs(journeyRef);
    const journey = journeyDoc.data();

    if (!journey) {
      throw new Error('Journey not found');
    }

    const { stops, startPoint } = journey;
    let optimizedRoute;

    try {
      // Try Google Maps API first
      optimizedRoute = await optimizeRouteWithGoogleMaps(stops, startPoint);
    } catch (error) {
      console.warn('Falling back to local optimization algorithm');
      // Fallback to local algorithm
      switch (algorithm) {
        case OPTIMIZATION_ALGORITHMS.NEAREST_NEIGHBOR:
          optimizedRoute = nearestNeighborAlgorithm(stops, startPoint);
          break;
        case OPTIMIZATION_ALGORITHMS.GENETIC:
          optimizedRoute = geneticAlgorithm(stops, startPoint);
          break;
        case OPTIMIZATION_ALGORITHMS.SIMULATED_ANNEALING:
          optimizedRoute = simulatedAnnealingAlgorithm(stops, startPoint);
          break;
        default:
          throw new Error('Invalid optimization algorithm');
      }
    }

    await updateDoc(journeyRef, {
      optimizedRoute,
      updatedAt: Date.now()
    });

    return optimizedRoute;
  } catch (error) {
    console.error('Error optimizing journey route:', error);
    throw new Error('Failed to optimize journey route');
  }
};

// Update journey status
const updateJourneyStatus = async (journeyId, status) => {
  try {
    const journeyRef = doc(db, 'journeys', journeyId);
    await updateDoc(journeyRef, {
      status,
      updatedAt: Date.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating journey status:', error);
    throw new Error('Failed to update journey status');
  }
};

// Get journey details
const getJourneyDetails = async (journeyId) => {
  try {
    const journeyRef = doc(db, 'journeys', journeyId);
    const journeyDoc = await getDocs(journeyRef);
    return journeyDoc.data();
  } catch (error) {
    console.error('Error getting journey details:', error);
    throw new Error('Failed to get journey details');
  }
};

// Get driver's active journeys
const getDriverActiveJourneys = async (driverId) => {
  try {
    const journeysRef = collection(db, 'journeys');
    const q = query(
      journeysRef,
      where('driverId', '==', driverId),
      where('status', 'in', ['pending', 'in-progress'])
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting driver active journeys:', error);
    throw new Error('Failed to get driver active journeys');
  }
};

module.exports = {
  OPTIMIZATION_ALGORITHMS,
  createJourney,
  optimizeJourneyRoute,
  updateJourneyStatus,
  getJourneyDetails,
  getDriverActiveJourneys
}; 