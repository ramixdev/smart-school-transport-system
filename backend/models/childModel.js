const { db } = require('../config/firebase');

const childrenCollection = db.collection('children');

// Create child
const createChild = async (childData) => {
  try {
    const childRef = await childrenCollection.add(childData);
    return { id: childRef.id, ...childData };
  } catch (error) {
    throw new Error(`Error creating child: ${error.message}`);
  }
};

// Get child by ID
const getChildById = async (childId) => {
  try {
    const childDoc = await childrenCollection.doc(childId).get();
    if (!childDoc.exists) {
      return null;
    }
    return { id: childDoc.id, ...childDoc.data() };
  } catch (error) {
    throw new Error(`Error getting child: ${error.message}`);
  }
};

// Update child
const updateChild = async (childId, childData) => {
  try {
    await childrenCollection.doc(childId).update(childData);
    return { id: childId, ...childData };
  } catch (error) {
    throw new Error(`Error updating child: ${error.message}`);
  }
};

// Delete child
const deleteChild = async (childId) => {
  try {
    await childrenCollection.doc(childId).delete();
    return { success: true };
  } catch (error) {
    throw new Error(`Error deleting child: ${error.message}`);
  }
};

// Get all children by parent ID
const getChildrenByParentId = async (parentId) => {
  try {
    const snapshot = await childrenCollection.where('parentId', '==', parentId).get();
    const children = [];
    snapshot.forEach(doc => {
      children.push({ id: doc.id, ...doc.data() });
    });
    return children;
  } catch (error) {
    throw new Error(`Error getting children by parent ID: ${error.message}`);
  }
};

// Get all children by driver ID
const getChildrenByDriverId = async (driverId) => {
  try {
    const snapshot = await childrenCollection.where('driverId', '==', driverId).get();
    const children = [];
    snapshot.forEach(doc => {
      children.push({ id: doc.id, ...doc.data() });
    });
    return children;
  } catch (error) {
    throw new Error(`Error getting children by driver ID: ${error.message}`);
  }
};

// Get all children by school ID
const getChildrenBySchoolId = async (schoolId) => {
  try {
    const snapshot = await childrenCollection.where('schoolId', '==', schoolId).get();
    const children = [];
    snapshot.forEach(doc => {
      children.push({ id: doc.id, ...doc.data() });
    });
    return children;
  } catch (error) {
    throw new Error(`Error getting children by school ID: ${error.message}`);
  }
};

// Mark child as absent
const markChildAbsent = async (childId, isAbsent, date) => {
  try {
    const formattedDate = date || new Date().toISOString().split('T')[0];
    await childrenCollection.doc(childId).update({
      [`attendance.${formattedDate}`]: !isAbsent
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Error marking child as absent: ${error.message}`);
  }
};

module.exports = {
  createChild,
  getChildById,
  updateChild,
  deleteChild,
  getChildrenByParentId,
  getChildrenByDriverId,
  getChildrenBySchoolId,
  markChildAbsent
}; 