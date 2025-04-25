const { db } = require('../config/firebase');
const { AttendanceError, validateAttendanceData, formatDateRange } = require('../utils/attendanceUtils');
const { createAuditLog } = require('../utils/auditLogger');

const attendanceCollection = db.collection('attendance');

// Core functionalities - unchanged
const createAttendanceRecord = async (attendanceData, userId) => {
  try {
    const errors = validateAttendanceData(attendanceData);
    if (errors.length > 0) {
      throw {
        code: AttendanceError.INVALID_INPUT,
        message: errors.join(', ')
      };
    }

    // Get child's route for optimization
    const childDoc = await db.collection('children').doc(attendanceData.childId).get();
    if (!childDoc.exists) {
      throw {
        code: AttendanceError.NOT_FOUND,
        message: 'Child not found'
      };
    }
    const routeId = childDoc.data().route;

    const attendanceRef = await attendanceCollection.add({
      ...attendanceData,
      routeId,
      timestamp: attendanceData.timestamp || new Date(),
      createdAt: new Date()
    });

    const newRecord = { id: attendanceRef.id, ...attendanceData, routeId };
    await createAuditLog(attendanceRef.id, 'CREATE', newRecord, userId);
    return newRecord;
  } catch (error) {
    if (error.code) throw error;
    throw {
      code: AttendanceError.DATABASE_ERROR,
      message: `Error creating attendance record: ${error.message}`
    };
  }
};

// Enhanced batch operations
const batchCreateAttendance = async (attendanceRecords, userId) => {
  try {
    const batch = db.batch();
    const results = [];
    
    for (const record of attendanceRecords) {
      const errors = validateAttendanceData(record);
      if (errors.length > 0) {
        throw {
          code: AttendanceError.INVALID_INPUT,
          message: `Invalid record for child ${record.childId}: ${errors.join(', ')}`
        };
      }

      const childDoc = await db.collection('children').doc(record.childId).get();
      if (!childDoc.exists) continue; // Skip invalid children
      const routeId = childDoc.data().route;

      const docRef = attendanceCollection.doc();
      const recordData = {
        ...record,
        routeId,
        timestamp: record.timestamp || new Date(),
        createdAt: new Date()
      };
      
      batch.set(docRef, recordData);
      results.push({ id: docRef.id, ...recordData });
    }
    
    await batch.commit();
    
    // Log batch creation
    for (const result of results) {
      await createAuditLog(result.id, 'BATCH_CREATE', result, userId);
    }
    
    return results;
  } catch (error) {
    if (error.code) throw error;
    throw {
      code: AttendanceError.DATABASE_ERROR,
      message: `Error in batch attendance creation: ${error.message}`
    };
  }
};

// Enhanced attendance verification
const verifyAttendance = async (childId, date, type) => {
  try {
    const { startOfDay, endOfDay } = formatDateRange(date);

    const snapshot = await attendanceCollection
      .where('childId', '==', childId)
      .where('type', '==', type)
      .where('timestamp', '>=', startOfDay)
      .where('timestamp', '<=', endOfDay)
      .get();

    return !snapshot.empty;
  } catch (error) {
    throw {
      code: AttendanceError.DATABASE_ERROR,
      message: `Error verifying attendance: ${error.message}`
    };
  }
};

// Enhanced attendance statistics
const getAttendanceStats = async (schoolId, startDate, endDate) => {
  try {
    const childrenSnapshot = await db.collection('children')
      .where('school', '==', schoolId)
      .get();

    const childIds = [];
    childrenSnapshot.forEach(doc => childIds.push(doc.id));

    const snapshot = await attendanceCollection
      .where('childId', 'in', childIds)
      .where('timestamp', '>=', new Date(startDate))
      .where('timestamp', '<=', new Date(endDate))
      .get();

    const records = [];
    snapshot.forEach(doc => records.push(doc.data()));

    const stats = {
      totalDays: Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)),
      totalStudents: childrenSnapshot.size,
      attendanceByStatus: {
        present: records.filter(r => r.status === 'present').length,
        absent: records.filter(r => r.status === 'absent').length,
        late: records.filter(r => r.status === 'late').length,
        excused: records.filter(r => r.status === 'excused').length
      },
      attendanceByType: {
        pickup: records.filter(r => r.type === 'pickup').length,
        dropoff: records.filter(r => r.type === 'dropoff').length
      }
    };
    
    stats.attendanceRate = (stats.attendanceByStatus.present / 
      (stats.totalStudents * stats.totalDays * 2)) * 100;

    return stats;
  } catch (error) {
    throw {
      code: AttendanceError.DATABASE_ERROR,
      message: `Error getting attendance statistics: ${error.message}`
    };
  }
};

// Enhanced filtered queries
const getFilteredAttendance = async (filters) => {
  try {
    let query = attendanceCollection;
    
    if (filters.schoolId) {
      const childrenSnapshot = await db.collection('children')
        .where('school', '==', filters.schoolId)
        .get();
      const childIds = [];
      childrenSnapshot.forEach(doc => childIds.push(doc.id));
      query = query.where('childId', 'in', childIds);
    }
    
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    
    if (filters.type) {
      query = query.where('type', '==', filters.type);
    }
    
    if (filters.startDate) {
      query = query.where('timestamp', '>=', new Date(filters.startDate));
    }
    
    if (filters.endDate) {
      query = query.where('timestamp', '<=', new Date(filters.endDate));
    }
    
    const snapshot = await query.get();
    const records = [];
    snapshot.forEach(doc => records.push({ id: doc.id, ...doc.data() }));
    
    return records;
  } catch (error) {
    throw {
      code: AttendanceError.DATABASE_ERROR,
      message: `Error in filtered attendance query: ${error.message}`
    };
  }
};

// Data consistency check
const checkAttendanceConsistency = async (childId, date) => {
  try {
    const { startOfDay, endOfDay } = formatDateRange(date);

    const snapshot = await attendanceCollection
      .where('childId', '==', childId)
      .where('timestamp', '>=', startOfDay)
      .where('timestamp', '<=', endOfDay)
      .get();

    const records = [];
    snapshot.forEach(doc => records.push(doc.data()));

    const pickups = records.filter(r => r.type === 'pickup');
    const dropoffs = records.filter(r => r.type === 'dropoff');

    return {
      hasInconsistencies: pickups.length > 1 || dropoffs.length > 1,
      duplicatePickups: pickups.length > 1,
      duplicateDropoffs: dropoffs.length > 1,
      records: records
    };
  } catch (error) {
    throw {
      code: AttendanceError.DATABASE_ERROR,
      message: `Error checking attendance consistency: ${error.message}`
    };
  }
};

// Update existing functions with error handling and audit logging
const updateAttendance = async (attendanceId, updateData, userId) => {
  try {
    const docRef = attendanceCollection.doc(attendanceId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      throw {
        code: AttendanceError.NOT_FOUND,
        message: `Attendance record ${attendanceId} not found`
      };
    }

    if (updateData.status || updateData.type) {
      const errors = validateAttendanceData({ ...doc.data(), ...updateData });
      if (errors.length > 0) {
        throw {
          code: AttendanceError.INVALID_INPUT,
          message: errors.join(', ')
        };
      }
    }

    await docRef.update({
      ...updateData,
      updatedAt: new Date()
    });
    
    const updatedDoc = await docRef.get();
    const updatedData = { id: updatedDoc.id, ...updatedDoc.data() };
    await createAuditLog(attendanceId, 'UPDATE', updateData, userId);
    
    return updatedData;
  } catch (error) {
    if (error.code) throw error;
    throw {
      code: AttendanceError.DATABASE_ERROR,
      message: `Error updating attendance: ${error.message}`
    };
  }
};

// Export all functions
module.exports = {
  // Core functionalities
  createAttendanceRecord,
  getAttendanceByChild: async (childId, startDate, endDate) => {
    try {
      const snapshot = await attendanceCollection
        .where('childId', '==', childId)
        .where('timestamp', '>=', new Date(startDate))
        .where('timestamp', '<=', new Date(endDate))
        .orderBy('timestamp', 'desc')
        .get();

      const attendance = [];
      snapshot.forEach(doc => {
        attendance.push({ id: doc.id, ...doc.data() });
      });
      return attendance;
    } catch (error) {
      throw {
        code: AttendanceError.DATABASE_ERROR,
        message: `Error getting attendance by child: ${error.message}`
      };
    }
  },
  getAttendanceByRoute: async (routeId, date) => {
    try {
      const { startOfDay, endOfDay } = formatDateRange(date);
      
      // Using optimized query with routeId
      const snapshot = await attendanceCollection
        .where('routeId', '==', routeId)
        .where('timestamp', '>=', startOfDay)
        .where('timestamp', '<=', endOfDay)
        .get();

      const attendance = [];
      snapshot.forEach(doc => {
        attendance.push({ id: doc.id, ...doc.data() });
      });
      return attendance;
    } catch (error) {
      throw {
        code: AttendanceError.DATABASE_ERROR,
        message: `Error getting attendance by route: ${error.message}`
      };
    }
  },
  updateAttendance,
  getDailyReport: async (schoolId, date) => {
    try {
      const { startOfDay, endOfDay } = formatDateRange(date);
      
      const childrenSnapshot = await db.collection('children')
        .where('school', '==', schoolId)
        .get();

      const childIds = [];
      childrenSnapshot.forEach(doc => childIds.push(doc.id));

      const snapshot = await attendanceCollection
        .where('childId', 'in', childIds)
        .where('timestamp', '>=', startOfDay)
        .where('timestamp', '<=', endOfDay)
        .get();

      const records = [];
      snapshot.forEach(doc => records.push({ id: doc.id, ...doc.data() }));

      return {
        total: childrenSnapshot.size,
        present: records.filter(record => record.status === 'present').length,
        absent: records.filter(record => record.status === 'absent').length,
        late: records.filter(record => record.status === 'late').length,
        excused: records.filter(record => record.status === 'excused').length,
        records: records
      };
    } catch (error) {
      throw {
        code: AttendanceError.DATABASE_ERROR,
        message: `Error getting daily report: ${error.message}`
      };
    }
  },

  // New functionalities
  batchCreateAttendance,
  verifyAttendance,
  getAttendanceStats,
  getFilteredAttendance,
  checkAttendanceConsistency
}; 