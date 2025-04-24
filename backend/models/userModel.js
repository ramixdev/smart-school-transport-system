const { db } = require('../config/firebase');

const usersCollection = db.collection('users');

// Create or update user
const createUser = async (userId, userData) => {
  try {
    await usersCollection.doc(userId).set(userData, { merge: true });
    return { id: userId, ...userData };
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
};

// Get user by ID
const getUserById = async (userId) => {
  try {
    const userDoc = await usersCollection.doc(userId).get();
    if (!userDoc.exists) {
      return null;
    }
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    throw new Error(`Error getting user: ${error.message}`);
  }
};

// Update user
const updateUser = async (userId, userData) => {
  try {
    await usersCollection.doc(userId).update(userData);
    return { id: userId, ...userData };
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
};

// Delete user
const deleteUser = async (userId) => {
  try {
    await usersCollection.doc(userId).delete();
    return { success: true };
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
};

// Get all users
const getAllUsers = async () => {
  try {
    const snapshot = await usersCollection.get();
    const users = [];
    snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    throw new Error(`Error getting all users: ${error.message}`);
  }
};

// Get users by type (parent, driver, admin)
const getUsersByType = async (userType) => {
  try {
    const snapshot = await usersCollection.where('userType', '==', userType).get();
    const users = [];
    snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    throw new Error(`Error getting users by type: ${error.message}`);
  }
};

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  getUsersByType
}; 