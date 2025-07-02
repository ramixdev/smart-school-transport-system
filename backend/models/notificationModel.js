const { db } = require('../config/firebase');

const notificationsCollection = db.collection('notifications');

// Create new notification
const createNotification = async (notificationData) => {
  try {
    const notificationRef = await notificationsCollection.add({
      ...notificationData,
      createdAt: new Date(),
      status: 'unread',
      type: notificationData.type, // 'journey', 'enrollment', 'system', etc.
      priority: notificationData.priority || 'normal'
    });
    return { id: notificationRef.id, ...notificationData };
  } catch (error) {
    throw new Error(`Error creating notification: ${error.message}`);
  }
};

// Get notification by ID
const getNotificationById = async (notificationId) => {
  try {
    const notificationDoc = await notificationsCollection.doc(notificationId).get();
    if (!notificationDoc.exists) {
      return null;
    }
    return { id: notificationDoc.id, ...notificationDoc.data() };
  } catch (error) {
    throw new Error(`Error getting notification: ${error.message}`);
  }
};

// Update notification
const updateNotification = async (notificationId, notificationData) => {
  try {
    await notificationsCollection.doc(notificationId).update({
      ...notificationData,
      updatedAt: new Date()
    });
    return { id: notificationId, ...notificationData };
  } catch (error) {
    throw new Error(`Error updating notification: ${error.message}`);
  }
};

// Delete notification
const deleteNotification = async (notificationId) => {
  try {
    await notificationsCollection.doc(notificationId).delete();
    return { success: true };
  } catch (error) {
    throw new Error(`Error deleting notification: ${error.message}`);
  }
};

// Get notifications by user ID
const getNotificationsByUserId = async (userId) => {
  try {
    const snapshot = await notificationsCollection
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const notifications = [];
    snapshot.forEach(doc => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    return notifications;
  } catch (error) {
    throw new Error(`Error getting notifications by user ID: ${error.message}`);
  }
};

// Mark notification as read
const markNotificationAsRead = async (notificationId) => {
  try {
    await notificationsCollection.doc(notificationId).update({
      status: 'read',
      readAt: new Date()
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Error marking notification as read: ${error.message}`);
  }
};

// Create journey notification
const createJourneyNotification = async (journeyData, type) => {
  try {
    let notificationData = {
      type: 'journey',
      journeyId: journeyData.id,
      journeyType: journeyData.journeyType,
      timestamp: new Date()
    };

    switch (type) {
      case 'school_arrival':
        notificationData = {
          ...notificationData,
          title: 'Child Arrived at School',
          message: `Your child has arrived at ${journeyData.schoolName}`,
          priority: 'high'
        };
        break;
      case 'school_pickup':
        notificationData = {
          ...notificationData,
          title: 'Child Picked Up from School',
          message: `Your child has been picked up from ${journeyData.schoolName}`,
          priority: 'high'
        };
        break;
      case 'home_arrival':
        notificationData = {
          ...notificationData,
          title: 'Child Arrived Home',
          message: 'Your child has arrived home safely',
          priority: 'high'
        };
        break;
      case 'route_update':
        notificationData = {
          ...notificationData,
          title: 'Route Update',
          message: 'The journey route has been updated due to changes',
          priority: 'normal'
        };
        break;
      case 'early_arrival':
        notificationData = {
          ...notificationData,
          title: 'Early Arrival Notice',
          message: 'The driver will arrive 15 minutes earlier than usual',
          priority: 'high'
        };
        break;
    }

    return await createNotification(notificationData);
  } catch (error) {
    throw new Error(`Error creating journey notification: ${error.message}`);
  }
};

// Create enrollment notification
const createEnrollmentNotification = async (enrollmentData, type) => {
  try {
    let notificationData = {
      type: 'enrollment',
      enrollmentId: enrollmentData.id,
      timestamp: new Date()
    };

    switch (type) {
      case 'request':
        notificationData = {
          ...notificationData,
          title: 'New Enrollment Request',
          message: `New enrollment request for ${enrollmentData.childName}`,
          priority: 'normal'
        };
        break;
      case 'accepted':
        notificationData = {
          ...notificationData,
          title: 'Enrollment Accepted',
          message: `Enrollment request for ${enrollmentData.childName} has been accepted`,
          priority: 'high'
        };
        break;
      case 'rejected':
        notificationData = {
          ...notificationData,
          title: 'Enrollment Rejected',
          message: `Enrollment request for ${enrollmentData.childName} has been rejected`,
          priority: 'normal'
        };
        break;
    }

    return await createNotification(notificationData);
  } catch (error) {
    throw new Error(`Error creating enrollment notification: ${error.message}`);
  }
};

// Create system notification
const createSystemNotification = async (systemData) => {
  try {
    const notificationData = {
      type: 'system',
      title: systemData.title,
      message: systemData.message,
      priority: systemData.priority || 'normal',
      timestamp: new Date()
    };

    return await createNotification(notificationData);
  } catch (error) {
    throw new Error(`Error creating system notification: ${error.message}`);
  }
};

module.exports = {
  createNotification,
  getNotificationById,
  updateNotification,
  deleteNotification,
  getNotificationsByUserId,
  markNotificationAsRead,
  createJourneyNotification,
  createEnrollmentNotification,
  createSystemNotification
}; 