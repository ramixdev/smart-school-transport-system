const { db } = require('../config/firebase');

const feedbackCollection = db.collection('feedback');
const driversCollection = db.collection('drivers');

// Create new feedback/rating
const createFeedback = async (feedbackData) => {
  try {
    // Add the feedback
    const feedbackRef = await feedbackCollection.add({
      ...feedbackData,
      createdAt: new Date()
    });

    // Update driver's average rating
    const driverSnapshot = await driversCollection.doc(feedbackData.driverId).get();
    const driverData = driverSnapshot.data();
    
    let totalRatings = (driverData.totalRatings || 0) + 1;
    let totalRatingSum = (driverData.totalRatingSum || 0) + feedbackData.rating;
    let averageRating = totalRatingSum / totalRatings;

    await driversCollection.doc(feedbackData.driverId).update({
      totalRatings,
      totalRatingSum,
      averageRating,
      updatedAt: new Date()
    });

    return { 
      id: feedbackRef.id, 
      ...feedbackData,
      averageRating 
    };
  } catch (error) {
    throw new Error(`Error creating feedback: ${error.message}`);
  }
};

// Update feedback
const updateFeedback = async (feedbackId, feedbackData, oldRating) => {
  try {
    // Update the feedback
    await feedbackCollection.doc(feedbackId).update({
      ...feedbackData,
      updatedAt: new Date()
    });

    // Update driver's average rating
    const driverSnapshot = await driversCollection.doc(feedbackData.driverId).get();
    const driverData = driverSnapshot.data();
    
    let totalRatingSum = (driverData.totalRatingSum || 0) - oldRating + feedbackData.rating;
    let averageRating = totalRatingSum / (driverData.totalRatings || 1);

    await driversCollection.doc(feedbackData.driverId).update({
      totalRatingSum,
      averageRating,
      updatedAt: new Date()
    });

    return { 
      id: feedbackId, 
      ...feedbackData,
      averageRating 
    };
  } catch (error) {
    throw new Error(`Error updating feedback: ${error.message}`);
  }
};

// Get feedback by ID
const getFeedbackById = async (feedbackId) => {
  try {
    const feedbackDoc = await feedbackCollection.doc(feedbackId).get();
    if (!feedbackDoc.exists) {
      return null;
    }
    return { id: feedbackDoc.id, ...feedbackDoc.data() };
  } catch (error) {
    throw new Error(`Error getting feedback: ${error.message}`);
  }
};

// Get all feedback for a driver
const getFeedbackByDriverId = async (driverId) => {
  try {
    const snapshot = await feedbackCollection
      .where('driverId', '==', driverId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const feedback = [];
    snapshot.forEach(doc => {
      feedback.push({ id: doc.id, ...doc.data() });
    });
    return feedback;
  } catch (error) {
    throw new Error(`Error getting feedback by driver: ${error.message}`);
  }
};

// Get feedback by parent for a specific driver
const getFeedbackByParentAndDriver = async (parentId, driverId) => {
  try {
    const snapshot = await feedbackCollection
      .where('parentId', '==', parentId)
      .where('driverId', '==', driverId)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    throw new Error(`Error getting feedback by parent and driver: ${error.message}`);
  }
};

// Get driver's average rating
const getDriverRating = async (driverId) => {
  try {
    const driverDoc = await driversCollection.doc(driverId).get();
    if (!driverDoc.exists) {
      return null;
    }
    const driverData = driverDoc.data();
    return {
      averageRating: driverData.averageRating || 0,
      totalRatings: driverData.totalRatings || 0
    };
  } catch (error) {
    throw new Error(`Error getting driver rating: ${error.message}`);
  }
};

module.exports = {
  createFeedback,
  updateFeedback,
  getFeedbackById,
  getFeedbackByDriverId,
  getFeedbackByParentAndDriver,
  getDriverRating
}; 