const { db } = require('../config/firebase');

const createAuditLog = async (attendanceId, action, changes, userId) => {
  try {
    await db.collection('attendance_audit').add({
      attendanceId,
      action,
      changes,
      userId,
      timestamp: new Date()
    });
  } catch (error) {
    console.error(`Error creating audit log: ${error.message}`);
    // Don't throw - audit logging should not break main functionality
  }
};

const getAuditLogs = async (attendanceId) => {
  try {
    const snapshot = await db.collection('attendance_audit')
      .where('attendanceId', '==', attendanceId)
      .orderBy('timestamp', 'desc')
      .get();

    const logs = [];
    snapshot.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    return logs;
  } catch (error) {
    console.error(`Error retrieving audit logs: ${error.message}`);
    return [];
  }
};

module.exports = {
  createAuditLog,
  getAuditLogs
}; 