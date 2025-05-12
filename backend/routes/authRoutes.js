const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  getCurrentUserProfile, 
  updateUserProfile, 
  changePassword,
  deleteUserAccount,
  updateFcmToken
} = require('../controllers/userController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');
const { validateUserData } = require('../middleware/validationMiddleware');

// Public routes
router.post('/register', validateUserData, registerUser);

// Protected routes
router.get('/profile', verifyFirebaseToken, getCurrentUserProfile);
router.put('/profile', verifyFirebaseToken, updateUserProfile);
router.post('/change-password', verifyFirebaseToken, changePassword);
router.delete('/delete-account', verifyFirebaseToken, deleteUserAccount);
router.post('/fcm-token', verifyFirebaseToken, updateFcmToken);

module.exports = router; 