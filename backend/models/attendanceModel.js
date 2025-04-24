const { db } = require('../config/firebase');

const attendanceCollection = db.collection('attendance');

// Create attendance record
const createAttendanceRecord = async (attendanceData) => {
  try {
    const attendanceRef = await attendanceCollection.add({
      ...attendanceData,
      createdAt: new Date()
    });
    return { id: attendanceRef.id, ...attendanceData };
  } catch (error) {
    throw new Error(`Error creating attendance record: ${error.message}`);
  }
};

// Get attendance by ID
const getAttendanceById = async (attendanceId) => {
  try {
    const attendanceDoc = await attendanceCollection.doc(attendanceId).get();
    if (!attendanceDoc.exists) {
      return null;
    }
    return { id: attendanceDoc.id, ...attendanceDoc.data() };
  } catch (error) {
    throw new Error(`Error getting attendance: ${error.message}`);
  }
};

// Mark child absent
const markChildAbsent = async (childId, date, journeyType) => {
  try {
    const formattedDate = date || new Date().toISOString().split('T')[0];
    await attendanceCollection.add({
      childId,
      date: formattedDate,
      journeyType,
      status: 'absent',
      markedBy: 'parent',
      createdAt: new Date()
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Error marking child absent: ${error.message}`);
  }
};

// Mark child present
const markChildPresent = async (childId, date, journeyType, location) => {
  try {
    const formattedDate = date || new Date().toISOString().split('T')[0];
    await attendanceCollection.add({
      childId,
      date: formattedDate,
      journeyType,
      status: 'present',
      location,
      markedBy: 'driver',
      createdAt: new Date()
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Error marking child present: ${error.message}`);
  }
};

// Get attendance by child ID and date
const getAttendanceByChildAndDate = async (childId, date) => {
  try {
    const formattedDate = date || new Date().toISOString().split('T')[0];
    const snapshot = await attendanceCollection
      .where('childId', '==', childId)
      .where('date', '==', formattedDate)
      .orderBy('createdAt', 'desc')
      .get();
    
    const attendance = [];
    snapshot.forEach(doc => {
      attendance.push({ id: doc.id, ...doc.data() });
    });
    return attendance;
  } catch (error) {
    throw new Error(`Error getting attendance by child and date: ${error.message}`);
  }
};

// Get attendance by route and date
const getAttendanceByRouteAndDate = async (routeId, date) => {
  try {
    const formattedDate = date || new Date().toISOString().split('T')[0];
    const snapshot = await attendanceCollection
      .where('routeId', '==', routeId)
      .where('date', '==', formattedDate)
      .orderBy('createdAt', 'desc')
      .get();
    
    const attendance = [];
    snapshot.forEach(doc => {
      attendance.push({ id: doc.id, ...doc.data() });
    });
    return attendance;
  } catch (error) {
    throw new Error(`Error getting attendance by route and date: ${error.message}`);
  }
};

// Get present children for journey
const getPresentChildrenForJourney = async (routeId, date, journeyType) => {
  try {
    const formattedDate = date || new Date().toISOString().split('T')[0];
    const snapshot = await attendanceCollection
      .where('routeId', '==', routeId)
      .where('date', '==', formattedDate)
      .where('journeyType', '==', journeyType)
      .where('status', '==', 'present')
      .orderBy('createdAt', 'desc')
      .get();
    
    const children = [];
    snapshot.forEach(doc => {
      children.push({ id: doc.id, ...doc.data() });
    });
    return children;
  } catch (error) {
    throw new Error(`Error getting present children for journey: ${error.message}`);
  }
};

// Get absent children for journey
const getAbsentChildrenForJourney = async (routeId, date, journeyType) => {
  try {
    const formattedDate = date || new Date().toISOString().split('T')[0];
    const snapshot = await attendanceCollection
      .where('routeId', '==', routeId)
      .where('date', '==', formattedDate)
      .where('journeyType', '==', journeyType)
      .where('status', '==', 'absent')
      .orderBy('createdAt', 'desc')
      .get();
    
    const children = [];
    snapshot.forEach(doc => {
      children.push({ id: doc.id, ...doc.data() });
    });
    return children;
  } catch (error) {
    throw new Error(`Error getting absent children for journey: ${error.message}`);
  }
};

module.exports = {
  createAttendanceRecord,
  getAttendanceById,
  markChildAbsent,
  markChildPresent,
  getAttendanceByChildAndDate,
  getAttendanceByRouteAndDate,
  getPresentChildrenForJourney,
  getAbsentChildrenForJourney
}; 