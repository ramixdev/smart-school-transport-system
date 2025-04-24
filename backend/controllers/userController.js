const { auth, admin } = require('../config/firebase');
const { createUser, getUserById, updateUser, deleteUser, getAllUsers, getUsersByType } = require('../models/userModel');

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { email, password, name, userType, contactNumber, location } = req.body;

    // Create the user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });

    // Create user profile in Firestore
    const userData = {
      email,
      name,
      userType,
      contactNumber: contactNumber || '',
      location: location || null,
      createdAt: new Date()
    };

    const user = await createUser(userRecord.uid, userData);
    
    // Set custom claims based on user type
    await auth.setCustomUserClaims(userRecord.uid, { userType });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// Get current user profile
const getCurrentUserProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const user = await getUserById(uid);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const { name, contactNumber, location } = req.body;
    
    const user = await getUserById(uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const updatedData = {
      ...(name && { name }),
      ...(contactNumber && { contactNumber }),
      ...(location && { location }),
      updatedAt: new Date()
    };
    
    // Update user display name in Firebase Auth if name is provided
    if (name) {
      await auth.updateUser(uid, { displayName: name });
    }
    
    const updatedUser = await updateUser(uid, updatedData);
    
    res.status(200).json({ message: 'User profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
};

// Change user password
const changePassword = async (req, res) => {
  try {
    const { uid } = req.user;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    await auth.updateUser(uid, { password: newPassword });
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

// Delete user account
const deleteUserAccount = async (req, res) => {
  try {
    const { uid } = req.user;
    
    // Delete user from Firebase Auth
    await auth.deleteUser(uid);
    
    // Delete user profile from Firestore
    await deleteUser(uid);
    
    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ message: 'Error deleting user account', error: error.message });
  }
};

// Admin: Get all users
const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Error fetching all users', error: error.message });
  }
};

// Admin: Get users by type
const getUsersByTypeAdmin = async (req, res) => {
  try {
    const { userType } = req.params;
    
    if (!['admin', 'parent', 'driver'].includes(userType)) {
      return res.status(400).json({ message: 'Invalid user type' });
    }
    
    const users = await getUsersByType(userType);
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users by type:', error);
    res.status(500).json({ message: 'Error fetching users by type', error: error.message });
  }
};

// Admin: Delete any user
const deleteUserByIdAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Delete user from Firebase Auth
    await auth.deleteUser(userId);
    
    // Delete user profile from Firestore
    await deleteUser(userId);
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

module.exports = {
  registerUser,
  getCurrentUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
  getAllUsersAdmin,
  getUsersByTypeAdmin,
  deleteUserByIdAdmin
}; 