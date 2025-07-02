import { getAuth } from '../contexts/firebase';
import { auth } from '../contexts/firebase';

// API Base URL - change this based on environment
const API_BASE_URL = 'http://172.20.10.3:5000/api';

// Helper method to get the current user's ID token
const getAuthToken = async () => {
  if (auth.currentUser) {
    try {
      return await auth.currentUser.getIdToken();
    } catch (error) {
      console.error('Error getting ID token:', error);
      throw new Error('Authentication required');
    }
  }
  throw new Error('User not authenticated');
};

// Generic API request with authentication
const apiRequest = async (endpoint, options = {}) => {
  try {
    // Get the auth token
    const token = await getAuthToken();

    // Set default headers with auth token
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    // Create request options
    const requestOptions = {
      ...options,
      headers
    };

    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
    
    // Parse response JSON
    const data = await response.json();
    
    // Check if response is successful
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  // Register user
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  // Get current user profile
  getProfile: async () => {
    return apiRequest('/auth/profile');
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },
  
  // Change password
  changePassword: async (newPassword) => {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    });
  },
  
  // Delete account
  deleteAccount: async () => {
    return apiRequest('/auth/delete-account', {
      method: 'DELETE'
    });
  }
};

// Parent API
export const parentAPI = {
  // Get parent profile with children
  getProfile: async () => {
    return apiRequest('/parent/profile');
  },
  
  // Add a child
  addChild: async (childData) => {
    return apiRequest('/parent/child', {
      method: 'POST',
      body: JSON.stringify(childData)
    });
  },
  
  // Update child details
  updateChild: async (childId, childData) => {
    return apiRequest(`/parent/child/${childId}`, {
      method: 'PUT',
      body: JSON.stringify(childData)
    });
  },
  
  // Upload child profile image
  uploadChildImage: async (childId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const token = await getAuthToken();
    
    return fetch(`${API_BASE_URL}/parent/child/${childId}/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }).then(response => response.json());
  },
  
  // Delete a child
  deleteChild: async (childId) => {
    return apiRequest(`/parent/child/${childId}`, {
      method: 'DELETE'
    });
  },
  
  // Mark child as absent
  markChildAbsent: async (childId, isAbsent, date) => {
    return apiRequest(`/parent/child/${childId}/attendance`, {
      method: 'POST',
      body: JSON.stringify({ isAbsent, date })
    });
  },
  
  // Request driver enrollment
  requestEnrollment: async (enrollmentData) => {
    return apiRequest('/parent/enrollment', {
      method: 'POST',
      body: JSON.stringify(enrollmentData)
    });
  },
  
  // Get enrollment requests
  getEnrollments: async () => {
    return apiRequest('/parent/enrollments');
  }
};

// Driver API
export const driverAPI = {
  // Get driver profile
  getProfile: async () => {
    return apiRequest('/driver/profile');
  },
  
  // Create driver profile
  createProfile: async (profileData) => {
    return apiRequest('/driver/profile', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
  },
  
  // Update driver profile
  updateProfile: async (profileData) => {
    return apiRequest('/driver/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },
  
  // Update vehicle details
  updateVehicle: async (vehicleData) => {
    return apiRequest('/driver/vehicle', {
      method: 'POST',
      body: JSON.stringify(vehicleData)
    });
  },
  
  // Upload vehicle images
  uploadVehicleImages: async (imageFiles) => {
    const formData = new FormData();
    imageFiles.forEach((file, index) => {
      formData.append('images', file);
    });
    
    const token = await getAuthToken();
    
    return fetch(`${API_BASE_URL}/driver/vehicle/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }).then(response => response.json());
  },
  
  // Add school to driver
  addSchool: async (schoolId) => {
    return apiRequest('/driver/school', {
      method: 'POST',
      body: JSON.stringify({ schoolId })
    });
  },
  
  // Remove school from driver
  removeSchool: async (schoolId) => {
    return apiRequest(`/driver/school/${schoolId}`, {
      method: 'DELETE'
    });
  },
  
  // Get pending enrollments
  getPendingEnrollments: async () => {
    return apiRequest('/driver/enrollments');
  },
  
  // Respond to enrollment request
  respondToEnrollment: async (enrollmentId, status, notes) => {
    return apiRequest(`/driver/enrollment/${enrollmentId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
  },
  
  // Get enrolled children
  getEnrolledChildren: async () => {
    return apiRequest('/driver/children');
  },
  
  // Remove child from driver
  removeChild: async (childId) => {
    return apiRequest(`/driver/child/${childId}`, {
      method: 'DELETE'
    });
  },
  
  // Create journey
  createJourney: async (journeyData) => {
    return apiRequest('/driver/journey', {
      method: 'POST',
      body: JSON.stringify(journeyData)
    });
  },
  
  // Get journeys by date
  getJourneys: async (date, journeyType) => {
    let query = '';
    if (date) query += `date=${date}`;
    if (journeyType) query += `&journeyType=${journeyType}`;
    
    return apiRequest(`/driver/journeys?${query}`);
  },
  
  // Start journey
  startJourney: async (journeyId, startLocation) => {
    return apiRequest(`/driver/journey/${journeyId}/start`, {
      method: 'POST',
      body: JSON.stringify({ startLocation })
    });
  },
  
  // End journey
  endJourney: async (journeyId) => {
    return apiRequest(`/driver/journey/${journeyId}/end`, {
      method: 'POST'
    });
  },
  
  // Update driver location
  updateLocation: async (journeyId, location) => {
    return apiRequest(`/driver/journey/${journeyId}/location`, {
      method: 'PUT',
      body: JSON.stringify({ location })
    });
  },
  
  // Update driver's schools
  updateSchools: async (schoolIds) => {
    return apiRequest('/driver/schools', {
      method: 'PUT',
      body: JSON.stringify({ schoolIds })
    });
  }
};

// Admin API
export const adminAPI = {
  // Get dashboard stats
  getDashboardStats: async () => {
    return apiRequest('/admin/dashboard');
  },
  
  // Get all users
  getAllUsers: async () => {
    return apiRequest('/admin/users');
  },
  
  // Get users by type
  getUsersByType: async (userType) => {
    return apiRequest(`/admin/users/${userType}`);
  },
  
  // Delete user
  deleteUser: async (userId) => {
    return apiRequest(`/admin/user/${userId}`, {
      method: 'DELETE'
    });
  },
  
  // Get all drivers with details
  getAllDrivers: async () => {
    return apiRequest('/admin/drivers');
  },
  
  // Delete driver
  deleteDriver: async (driverId) => {
    return apiRequest(`/admin/driver/${driverId}`, {
      method: 'DELETE'
    });
  },
  
  // Get all students
  getAllStudents: async () => {
    return apiRequest('/admin/students');
  },
  
  // Get students by school
  getStudentsBySchool: async (schoolId) => {
    return apiRequest(`/admin/students/school/${schoolId}`);
  },
  
  // Delete student
  deleteStudent: async (childId) => {
    return apiRequest(`/admin/student/${childId}`, {
      method: 'DELETE'
    });
  },
  
  // Get all schools
  getAllSchools: async () => {
    return apiRequest('/admin/schools');
  },
  
  // Add school
  addSchool: async (schoolData) => {
    return apiRequest('/admin/school', {
      method: 'POST',
      body: JSON.stringify(schoolData)
    });
  },
  
  // Update school
  updateSchool: async (schoolId, schoolData) => {
    return apiRequest(`/admin/school/${schoolId}`, {
      method: 'PUT',
      body: JSON.stringify(schoolData)
    });
  },
  
  // Delete school
  deleteSchool: async (schoolId) => {
    return apiRequest(`/admin/school/${schoolId}`, {
      method: 'DELETE'
    });
  }
};

// School API (available to all authenticated users)
export const schoolAPI = {
  // Get all schools
  getAllSchools: async () => {
    return apiRequest('/schools');
  },
  
  // Get school by ID
  getSchool: async (schoolId) => {
    return apiRequest(`/schools/${schoolId}`);
  },
  
  // Get drivers by school
  getDriversBySchool: async (schoolId) => {
    return apiRequest(`/schools/${schoolId}/drivers`);
  }
}; 