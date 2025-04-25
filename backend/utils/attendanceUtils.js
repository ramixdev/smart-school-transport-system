const AttendanceError = {
  INVALID_INPUT: 'INVALID_INPUT',
  NOT_FOUND: 'NOT_FOUND',
  DATABASE_ERROR: 'DATABASE_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY'
};

const validateAttendanceData = (data) => {
  const errors = [];
  
  if (!data.childId) errors.push('Child ID is required');
  if (!['present', 'absent', 'late', 'excused'].includes(data.status)) {
    errors.push('Invalid status value');
  }
  if (!['pickup', 'dropoff'].includes(data.type)) {
    errors.push('Invalid type value');
  }
  if (data.location && (!data.location.latitude || !data.location.longitude)) {
    errors.push('Invalid location format');
  }

  return errors;
};

const formatDateRange = (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

module.exports = {
  AttendanceError,
  validateAttendanceData,
  formatDateRange
}; 