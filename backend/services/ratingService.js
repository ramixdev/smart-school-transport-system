const { db } = require('../config/firebase');
const { createError, ErrorCodes } = require('../utils/errors');

// Add a rating for a driver
const addDriverRating = async (driverId, parentId, rating, comment = '') => {
  try {
    if (rating < 1 || rating > 5) {
      throw createError(ErrorCodes.VALIDATION_ERROR, 'Rating must be between 1 and 5');
    }

    const ratingRef = db.collection('driver_ratings').doc();
    await ratingRef.set({
      driverId,
      parentId,
      rating,
      comment,
      timestamp: new Date()
    });

    // Update driver's average rating
    await updateDriverAverageRating(driverId);

    return { id: ratingRef.id, rating, comment };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error adding rating: ${error.message}`);
  }
};

// Get all ratings for a driver
const getDriverRatings = async (driverId) => {
  try {
    const snapshot = await db.collection('driver_ratings')
      .where('driverId', '==', driverId)
      .orderBy('timestamp', 'desc')
      .get();

    const ratings = [];
    snapshot.forEach(doc => {
      ratings.push({ id: doc.id, ...doc.data() });
    });

    return ratings;
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error getting ratings: ${error.message}`);
  }
};

// Get driver's average rating
const getDriverAverageRating = async (driverId) => {
  try {
    const driverDoc = await db.collection('drivers').doc(driverId).get();
    if (!driverDoc.exists) {
      throw createError(ErrorCodes.NOT_FOUND, 'Driver not found');
    }

    return {
      averageRating: driverDoc.data().averageRating || 0,
      totalRatings: driverDoc.data().totalRatings || 0
    };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error getting average rating: ${error.message}`);
  }
};

// Update driver's average rating
const updateDriverAverageRating = async (driverId) => {
  try {
    const ratings = await getDriverRatings(driverId);
    if (ratings.length === 0) {
      await db.collection('drivers').doc(driverId).update({
        averageRating: 0,
        totalRatings: 0
      });
      return;
    }

    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const average = sum / ratings.length;

    await db.collection('drivers').doc(driverId).update({
      averageRating: Math.round(average * 10) / 10, // Round to 1 decimal place
      totalRatings: ratings.length
    });
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error updating average rating: ${error.message}`);
  }
};

// Get parent's ratings for a driver
const getParentRatingsForDriver = async (parentId, driverId) => {
  try {
    const snapshot = await db.collection('driver_ratings')
      .where('parentId', '==', parentId)
      .where('driverId', '==', driverId)
      .orderBy('timestamp', 'desc')
      .get();

    const ratings = [];
    snapshot.forEach(doc => {
      ratings.push({ id: doc.id, ...doc.data() });
    });

    return ratings;
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error getting parent ratings: ${error.message}`);
  }
};

// Update a rating
const updateRating = async (ratingId, rating, comment = '') => {
  try {
    if (rating < 1 || rating > 5) {
      throw createError(ErrorCodes.VALIDATION_ERROR, 'Rating must be between 1 and 5');
    }

    const ratingDoc = await db.collection('driver_ratings').doc(ratingId).get();
    if (!ratingDoc.exists) {
      throw createError(ErrorCodes.NOT_FOUND, 'Rating not found');
    }

    await db.collection('driver_ratings').doc(ratingId).update({
      rating,
      comment,
      updatedAt: new Date()
    });

    // Update driver's average rating
    await updateDriverAverageRating(ratingDoc.data().driverId);

    return { id: ratingId, rating, comment };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error updating rating: ${error.message}`);
  }
};

// Delete a rating
const deleteRating = async (ratingId) => {
  try {
    const ratingDoc = await db.collection('driver_ratings').doc(ratingId).get();
    if (!ratingDoc.exists) {
      throw createError(ErrorCodes.NOT_FOUND, 'Rating not found');
    }

    const driverId = ratingDoc.data().driverId;
    await db.collection('driver_ratings').doc(ratingId).delete();

    // Update driver's average rating
    await updateDriverAverageRating(driverId);

    return { success: true };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error deleting rating: ${error.message}`);
  }
};

module.exports = {
  addDriverRating,
  getDriverRatings,
  getDriverAverageRating,
  getParentRatingsForDriver,
  updateRating,
  deleteRating
}; 