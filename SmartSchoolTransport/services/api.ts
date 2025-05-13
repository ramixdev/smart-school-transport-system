import axios from 'axios';
import { API_URL } from '../constants/Config';
import { database } from '../contexts/firebase';
import { ref, set, onValue, Unsubscribe } from 'firebase/database';

// ... existing code ...

// Rating API
export const rateDriver = async (driverId: string, rating: number, comment?: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/parent/rate-driver`, {
      driverId,
      rating,
      comment
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDriverRating = async (driverId: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/parent/driver/${driverId}/rating`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateFcmToken = async (fcmToken: string, authToken: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/fcm-token`,
      { fcmToken },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateDriverLocation = async (driverId: string, latitude: number, longitude: number) => {
  await set(ref(database, `driver_locations/${driverId}/location`), {
    latitude,
    longitude,
    timestamp: Date.now(),
  });
};

export const subscribeToDriverLocation = (
  driverId: string,
  callback: (location: { latitude: number; longitude: number; timestamp: number } | null) => void
): Unsubscribe => {
  const locationRef = ref(database, `driver_locations/${driverId}/location`);
  return onValue(locationRef, (snapshot) => {
    callback(snapshot.val());
  });
};

// ... existing code ... 