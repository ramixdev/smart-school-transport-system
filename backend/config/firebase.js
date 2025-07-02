const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getDatabase } = require('firebase/database');
const { getMessaging } = require('firebase/messaging');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

// Initialize Firebase Client
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  databaseURL: process.env.FIREBASE_DATABASE_URL
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);
const messaging = getMessaging(app);

// Google Maps API configuration
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) {
  console.error('Google Maps API key is not configured');
}

// Cache configuration for route calculations
const routeCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to get cached route
const getCachedRoute = (key) => {
  const cached = routeCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.route;
  }
  return null;
};

// Helper function to cache route
const cacheRoute = (key, route) => {
  routeCache.set(key, {
    route,
    timestamp: Date.now()
  });
};

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of routeCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      routeCache.delete(key);
    }
  }
}, CACHE_TTL);

module.exports = {
  admin,
  db,
  realtimeDb,
  messaging,
  GOOGLE_MAPS_API_KEY,
  getCachedRoute,
  cacheRoute
}; 