const { getUserById } = require('../models/userModel');
const { createChild, updateChild, deleteChild, getChildrenByParentId, getChildById } = require('../models/childModel');
const { createEnrollmentRequest, getEnrollmentsByParentId } = require('../models/enrollmentModel');
const { uploadToFirebase } = require('../utils/firebaseStorage');

// Get parent profile with all children
const getParentProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    
    // Get parent user data
    const parent = await getUserById(uid);
    if (!parent || parent.userType !== 'parent') {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Get all children associated with this parent
    const children = await getChildrenByParentId(uid);
    
    res.status(200).json({ parent, children });
  } catch (error) {
    console.error('Error fetching parent profile:', error);
    res.status(500).json({ message: 'Error fetching parent profile', error: error.message });
  }
};

// Add a new child
const addChild = async (req, res) => {
  try {
    const { uid } = req.user;
    const { name, dateOfBirth, grade, schoolId } = req.body;
    
    // Create the child record in Firestore
    const childData = {
      name,
      dateOfBirth,
      grade,
      schoolId,
      parentId: uid,
      driverId: null, // Initially no driver is assigned
      createdAt: new Date(),
      profileImage: null // Initially no profile image
    };
    
    const child = await createChild(childData);
    
    res.status(201).json({ message: 'Child added successfully', child });
  } catch (error) {
    console.error('Error adding child:', error);
    res.status(500).json({ message: 'Error adding child', error: error.message });
  }
};

// Update child details
const updateChildDetails = async (req, res) => {
  try {
    const { uid } = req.user;
    const { childId } = req.params;
    const { name, dateOfBirth, grade, schoolId, driverId } = req.body;
    
    // Check if child exists and belongs to this parent
    const child = await getChildById(childId);
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    if (child.parentId !== uid) {
      return res.status(403).json({ message: 'You are not authorized to update this child' });
    }
    
    // Update child data
    const updatedData = {
      ...(name && { name }),
      ...(dateOfBirth && { dateOfBirth }),
      ...(grade && { grade }),
      ...(schoolId && { schoolId }),
      ...(driverId !== undefined && { driverId }),
      updatedAt: new Date()
    };
    
    const updatedChild = await updateChild(childId, updatedData);
    
    res.status(200).json({ message: 'Child details updated successfully', child: updatedChild });
  } catch (error) {
    console.error('Error updating child details:', error);
    res.status(500).json({ message: 'Error updating child details', error: error.message });
  }
};

// Upload child profile image
const uploadChildProfileImage = async (req, res) => {
  try {
    const { uid } = req.user;
    const { childId } = req.params;
    
    // Check if child exists and belongs to this parent
    const child = await getChildById(childId);
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    if (child.parentId !== uid) {
      return res.status(403).json({ message: 'You are not authorized to update this child' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    // Upload the image to Firebase Storage
    const imageUrl = await uploadToFirebase(req.file, `children/${childId}`);
    
    // Update child record with new image URL
    await updateChild(childId, { profileImage: imageUrl });
    
    res.status(200).json({ message: 'Profile image uploaded successfully', imageUrl });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Error uploading profile image', error: error.message });
  }
};

// Delete a child
const deleteChildProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const { childId } = req.params;
    
    // Check if child exists and belongs to this parent
    const child = await getChildById(childId);
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    if (child.parentId !== uid) {
      return res.status(403).json({ message: 'You are not authorized to delete this child' });
    }
    
    // Delete the child record
    await deleteChild(childId);
    
    res.status(200).json({ message: 'Child deleted successfully' });
  } catch (error) {
    console.error('Error deleting child:', error);
    res.status(500).json({ message: 'Error deleting child', error: error.message });
  }
};

// Mark child as absent
const markChildAbsent = async (req, res) => {
  try {
    const { uid } = req.user;
    const { childId } = req.params;
    const { isAbsent, date } = req.body;
    
    // Check if child exists and belongs to this parent
    const child = await getChildById(childId);
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    if (child.parentId !== uid) {
      return res.status(403).json({ message: 'You are not authorized to update this child' });
    }
    
    // Mark child as absent or not absent
    await updateChild(childId, {
      [`attendance.${date || new Date().toISOString().split('T')[0]}`]: isAbsent
    });
    
    res.status(200).json({ 
      message: isAbsent ? 'Child marked as absent' : 'Child marked as present', 
      date: date || new Date().toISOString().split('T')[0] 
    });
  } catch (error) {
    console.error('Error marking child absence:', error);
    res.status(500).json({ message: 'Error marking child absence', error: error.message });
  }
};

// Request driver enrollment
const requestDriverEnrollment = async (req, res) => {
  try {
    const { uid } = req.user;
    const { childId, driverId, schoolId } = req.body;
    
    // Check if child exists and belongs to this parent
    const child = await getChildById(childId);
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    if (child.parentId !== uid) {
      return res.status(403).json({ message: 'You are not authorized to request enrollment for this child' });
    }
    
    // Create enrollment request
    const enrollmentData = {
      childId,
      driverId,
      parentId: uid,
      schoolId,
      status: 'pending',
      createdAt: new Date()
    };
    
    const enrollment = await createEnrollmentRequest(enrollmentData);
    
    res.status(201).json({ message: 'Enrollment request sent successfully', enrollment });
  } catch (error) {
    console.error('Error requesting driver enrollment:', error);
    res.status(500).json({ message: 'Error requesting driver enrollment', error: error.message });
  }
};

// Get enrollment requests
const getEnrollmentRequests = async (req, res) => {
  try {
    const { uid } = req.user;
    
    const enrollments = await getEnrollmentsByParentId(uid);
    
    res.status(200).json({ enrollments });
  } catch (error) {
    console.error('Error fetching enrollment requests:', error);
    res.status(500).json({ message: 'Error fetching enrollment requests', error: error.message });
  }
};

module.exports = {
  getParentProfile,
  addChild,
  updateChildDetails,
  uploadChildProfileImage,
  deleteChildProfile,
  markChildAbsent,
  requestDriverEnrollment,
  getEnrollmentRequests
}; 