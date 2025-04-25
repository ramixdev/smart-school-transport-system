const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^\+?[\d\s-]{10,}$/;
  return re.test(phone);
};

const validateNIC = (nic) => {
  // Sri Lankan NIC validation
  const re = /^([0-9]{9}[vVxX]|[0-9]{12})$/;
  return re.test(nic);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
};

const validateLocation = (location) => {
  if (!location || typeof location !== 'object') return false;
  if (!location.latitude || !location.longitude) return false;
  if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') return false;
  if (location.latitude < -90 || location.latitude > 90) return false;
  if (location.longitude < -180 || location.longitude > 180) return false;
  return true;
};

const validateDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

const validateChildData = (data) => {
  const errors = [];
  
  if (!data.name) errors.push('Name is required');
  if (!data.dateOfBirth || !validateDate(data.dateOfBirth)) {
    errors.push('Valid date of birth is required');
  }
  if (!data.grade || isNaN(data.grade)) errors.push('Valid grade is required');
  if (!data.schoolId) errors.push('School ID is required');
  if (!data.parentId) errors.push('Parent ID is required');
  
  return errors;
};

const validateDriverData = (data) => {
  const errors = [];
  
  if (!data.name) errors.push('Name is required');
  if (!data.dateOfBirth || !validateDate(data.dateOfBirth)) {
    errors.push('Valid date of birth is required');
  }
  if (!data.nic || !validateNIC(data.nic)) {
    errors.push('Valid NIC number is required');
  }
  if (!data.experience || isNaN(data.experience)) {
    errors.push('Valid years of experience is required');
  }
  if (!data.address) errors.push('Address is required');
  if (!data.phone || !validatePhone(data.phone)) {
    errors.push('Valid phone number is required');
  }
  if (data.email && !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }
  
  return errors;
};

const validateVehicleData = (data) => {
  const errors = [];
  
  if (!data.vehicleNumber) errors.push('Vehicle number is required');
  if (!data.capacity || isNaN(data.capacity) || data.capacity <= 0) {
    errors.push('Valid vehicle capacity is required');
  }
  if (!data.startLocation || !validateLocation(data.startLocation)) {
    errors.push('Valid starting location is required');
  }
  
  return errors;
};

const validateSchoolData = (data) => {
  const errors = [];
  
  if (!data.name) errors.push('School name is required');
  if (!data.address) errors.push('School address is required');
  if (!data.location || !validateLocation(data.location)) {
    errors.push('Valid school location is required');
  }
  if (!data.contactNumber || !validatePhone(data.contactNumber)) {
    errors.push('Valid contact number is required');
  }
  
  return errors;
};

module.exports = {
  validateEmail,
  validatePhone,
  validateNIC,
  validatePassword,
  validateLocation,
  validateDate,
  validateChildData,
  validateDriverData,
  validateVehicleData,
  validateSchoolData
}; 