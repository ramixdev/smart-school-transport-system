const { db } = require('../config/firebase');
const { createError, ErrorCodes } = require('../utils/errors');

// Create enrollment request
const createEnrollmentRequest = async (childId, driverId, parentId) => {
  try {
    // Check if request already exists
    const existingRequest = await db.collection('enrollment_requests')
      .where('childId', '==', childId)
      .where('driverId', '==', driverId)
      .where('status', '==', 'pending')
      .get();

    if (!existingRequest.empty) {
      throw createError(ErrorCodes.DUPLICATE_ENTRY, 'Enrollment request already exists');
    }

    // Get child and driver details
    const [childDoc, driverDoc] = await Promise.all([
      db.collection('children').doc(childId).get(),
      db.collection('drivers').doc(driverId).get()
    ]);

    if (!childDoc.exists || !driverDoc.exists) {
      throw createError(ErrorCodes.NOT_FOUND, 'Child or driver not found');
    }

    // Check vehicle capacity
    const currentEnrollments = await db.collection('children')
      .where('driver', '==', driverId)
      .get();

    if (currentEnrollments.size >= driverDoc.data().vehicle.capacity) {
      throw createError(ErrorCodes.CAPACITY_EXCEEDED, 'Vehicle capacity exceeded');
    }

    const requestRef = await db.collection('enrollment_requests').add({
      childId,
      driverId,
      parentId,
      childName: childDoc.data().name,
      schoolId: childDoc.data().school,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return { id: requestRef.id, status: 'pending' };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error creating enrollment request: ${error.message}`);
  }
};

// Get driver's pending enrollment requests
const getDriverEnrollmentRequests = async (driverId) => {
  try {
    const snapshot = await db.collection('enrollment_requests')
      .where('driverId', '==', driverId)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get();

    const requests = [];
    for (const doc of snapshot.docs) {
      const request = { id: doc.id, ...doc.data() };
      // Get parent details
      const parentDoc = await db.collection('users').doc(request.parentId).get();
      request.parent = parentDoc.exists ? parentDoc.data() : null;
      requests.push(request);
    }

    return requests;
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error getting enrollment requests: ${error.message}`);
  }
};

// Process enrollment request
const processEnrollmentRequest = async (requestId, status, driverId) => {
  try {
    const requestDoc = await db.collection('enrollment_requests').doc(requestId).get();
    if (!requestDoc.exists) {
      throw createError(ErrorCodes.NOT_FOUND, 'Enrollment request not found');
    }

    const request = requestDoc.data();
    if (request.status !== 'pending') {
      throw createError(ErrorCodes.INVALID_STATUS, 'Request is not pending');
    }

    if (status === 'accepted') {
      // Check vehicle capacity again
      const currentEnrollments = await db.collection('children')
        .where('driver', '==', driverId)
        .get();

      const driverDoc = await db.collection('drivers').doc(driverId).get();
      if (currentEnrollments.size >= driverDoc.data().vehicle.capacity) {
        throw createError(ErrorCodes.CAPACITY_EXCEEDED, 'Vehicle capacity exceeded');
      }

      // Update child's driver
      await db.collection('children').doc(request.childId).update({
        driver: driverId,
        enrollmentDate: new Date()
      });
    }

    // Update request status
    await requestDoc.ref.update({
      status,
      updatedAt: new Date(),
      processedAt: new Date()
    });

    // Create notification for parent
    await createNotification(
      request.parentId,
      'enrollment_update',
      `Enrollment request ${status}`,
      {
        requestId,
        status,
        childId: request.childId,
        driverId
      }
    );

    return { success: true, status };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error processing enrollment request: ${error.message}`);
  }
};

// Create notification
const createNotification = async (userId, type, message, data = {}) => {
  try {
    const notificationRef = await db.collection('notifications').add({
      userId,
      type,
      message,
      data,
      read: false,
      createdAt: new Date()
    });

    return { id: notificationRef.id, message };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error creating notification: ${error.message}`);
  }
};

// Get user's notifications
const getUserNotifications = async (userId) => {
  try {
    const snapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const notifications = [];
    snapshot.forEach(doc => {
      notifications.push({ id: doc.id, ...doc.data() });
    });

    return notifications;
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error getting notifications: ${error.message}`);
  }
};

// Mark notification as read
const markNotificationAsRead = async (notificationId) => {
  try {
    await db.collection('notifications').doc(notificationId).update({
      read: true,
      readAt: new Date()
    });

    return { success: true };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error marking notification as read: ${error.message}`);
  }
};

module.exports = {
  createEnrollmentRequest,
  getDriverEnrollmentRequests,
  processEnrollmentRequest,
  createNotification,
  getUserNotifications,
  markNotificationAsRead
}; 