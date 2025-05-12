import axios from 'axios';
import { API_URL } from '../constants/Config';

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

// ... existing code ... 