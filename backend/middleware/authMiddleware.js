const { auth } = require('../config/firebase');
const { getUserById } = require('../models/userModel');

// Verify Firebase ID Token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Firebase auth error:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Check if user is Admin
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }

    const user = await getUserById(req.user.uid);
    if (user && user.userType === 'admin') {
      next();
    } else {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
  } catch (error) {
    console.error('Admin validation error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Check if user is Driver
const isDriver = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }

    const user = await getUserById(req.user.uid);
    if (user && user.userType === 'driver') {
      next();
    } else {
      return res.status(403).json({ message: 'Forbidden: Driver access required' });
    }
  } catch (error) {
    console.error('Driver validation error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Check if user is Parent
const isParent = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }

    const user = await getUserById(req.user.uid);
    if (user && user.userType === 'parent') {
      next();
    } else {
      return res.status(403).json({ message: 'Forbidden: Parent access required' });
    }
  } catch (error) {
    console.error('Parent validation error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Check if user is the resource owner or admin
const isResourceOwnerOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }

    const user = await getUserById(req.user.uid);
    // If user is admin, allow access
    if (user && user.userType === 'admin') {
      return next();
    }

    // If user is the resource owner (the ID matches), allow access
    const resourceUserId = req.params.userId || req.body.userId;
    if (resourceUserId && resourceUserId === req.user.uid) {
      return next();
    }

    // Otherwise, deny access
    return res.status(403).json({ message: 'Forbidden: You do not have permission to access this resource' });
  } catch (error) {
    console.error('Resource owner validation error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  verifyFirebaseToken,
  isAdmin,
  isDriver,
  isParent,
  isResourceOwnerOrAdmin
}; 