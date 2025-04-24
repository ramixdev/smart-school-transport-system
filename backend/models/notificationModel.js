const { db } = require('../config/firebase');

const notificationsCollection = db.collection('notifications');

// Create new notification
const createNotification = async (notificationData) => {
  try {
    const notificationRef = await notificationsCollection.add({
      ...notificationData,
      createdAt: new Date(),
      status: 'unread'
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

// Update notification status
const updateNotificationStatus = async (notificationId, status) => {
  try {
    await notificationsCollection.doc(notificationId).update({
      status,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Error updating notification status: ${error.message}`);
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
    throw new Error(`Error getting notifications by user: ${error.message}`);
  }
};

// Get unread notifications by user ID
const getUnreadNotificationsByUserId = async (userId) => {
  try {
    const snapshot = await notificationsCollection
      .where('userId', '==', userId)
      .where('status', '==', 'unread')
      .orderBy('createdAt', 'desc')
      .get();
    
    const notifications = [];
    snapshot.forEach(doc => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    return notifications;
  } catch (error) {
    throw new Error(`Error getting unread notifications: ${error.message}`);
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (userId) => {
  try {
    const snapshot = await notificationsCollection
      .where('userId', '==', userId)
      .where('status', '==', 'unread')
      .get();
    
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        status: 'read',
        updatedAt: new Date()
      });
    });
    
    await batch.commit();
    return { success: true };
  } catch (error) {
    throw new Error(`Error marking notifications as read: ${error.message}`);
  }
};

// Create emergency notification
const createEmergencyNotification = async (emergencyData) => {
  try {
    const notificationRef = await notificationsCollection.add({
      ...emergencyData,
      type: 'emergency',
      priority: 'high',
      createdAt: new Date(),
      status: 'unread'
    });
    return { id: notificationRef.id, ...emergencyData };
  } catch (error) {
    throw new Error(`Error creating emergency notification: ${error.message}`);
  }
};

module.exports = {
  createNotification,
  getNotificationById,
  updateNotificationStatus,
  getNotificationsByUserId,
  getUnreadNotificationsByUserId,
  markAllNotificationsAsRead,
  createEmergencyNotification
}; 