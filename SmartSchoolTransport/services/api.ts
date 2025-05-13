import axios from 'axios';
import { API_URL } from '../constants/Config';
import { database } from '../contexts/firebase';
import { ref, set, onValue, Unsubscribe } from 'firebase/database';
import { db } from '../contexts/firebase';
import { collection, getDocs } from 'firebase/firestore';

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

// Get driver details by driverId
export const getDriverDetails = async (driverId: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/parent/driver/${driverId}`);
    // Ensure id is present in the returned object
    return { id: driverId, ...response.data };
  } catch (error) {
    throw error;
  }
};

// Get child details by childId
export const getChildDetails = async (childId: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/parent/child/${childId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get parent profile
export const getParentProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/parent/profile`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete child by childId
export const deleteChild = async (childId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/api/parent/child/${childId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mark child as absent
export const markChildAbsent = async (childId: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/parent/child/${childId}/absent`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSchools = async () => {
  const schoolsRef = collection(db, 'schools');
  const snapshot = await getDocs(schoolsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ... existing code ... 