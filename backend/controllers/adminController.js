const { getAllUsersAdmin, getUsersByTypeAdmin, deleteUserByIdAdmin } = require('./userController');
const { getDriverById } = require('../models/driverModel');
const { getChildById, getChildrenBySchoolId, deleteChild } = require('../models/childModel');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get all users by type
    const parents = await getUsersByTypeAdmin({ params: { userType: 'parent' } }, { json: () => {} });
    const drivers = await getUsersByTypeAdmin({ params: { userType: 'driver' } }, { json: () => {} });
    
    // Calculate statistics
    const stats = {
      totalParents: parents.users ? parents.users.length : 0,
      totalDrivers: drivers.users ? drivers.users.length : 0,
      totalUsers: (parents.users ? parents.users.length : 0) + (drivers.users ? drivers.users.length : 0)
    };
    
    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

// Get all drivers with details
const getAllDriversWithDetails = async (req, res) => {
  try {
    // Get all drivers
    const driversResponse = await getUsersByTypeAdmin({ params: { userType: 'driver' } }, { json: () => {} });
    
    const driversWithDetails = [];
    if (driversResponse.users && driversResponse.users.length > 0) {
      // Get additional details for each driver
      for (const driver of driversResponse.users) {
        const driverDetails = await getDriverById(driver.id);
        if (driverDetails) {
          driversWithDetails.push({
            ...driver,
            ...driverDetails
          });
        }
      }
    }
    
    res.status(200).json({ drivers: driversWithDetails });
  } catch (error) {
    console.error('Error fetching drivers with details:', error);
    res.status(500).json({ message: 'Error fetching drivers with details', error: error.message });
  }
};

// Get all students (children)
const getAllStudents = async (req, res) => {
  try {
    // Get all parents
    const parentsResponse = await getUsersByTypeAdmin({ params: { userType: 'parent' } }, { json: () => {} });
    
    let children = [];
    if (parentsResponse.users && parentsResponse.users.length > 0) {
      // Get children for each parent
      for (const parent of parentsResponse.users) {
        const childrenByParent = await getChildrenByParentId(parent.id);
        if (childrenByParent && childrenByParent.length > 0) {
          children = [...children, ...childrenByParent.map(child => ({
            ...child,
            parentName: parent.name,
            parentContact: parent.contactNumber
          }))];
        }
      }
    }
    
    res.status(200).json({ 
      children,
      totalCount: children.length
    });
  } catch (error) {
    console.error('Error fetching all students:', error);
    res.status(500).json({ message: 'Error fetching all students', error: error.message });
  }
};

// Get students by school
const getStudentsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    // Get children for the school
    const children = await getChildrenBySchoolId(schoolId);
    
    // Enrich with parent details
    const parentsResponse = await getUsersByTypeAdmin({ params: { userType: 'parent' } }, { json: () => {} });
    
    const enrichedChildren = [];
    if (children && children.length > 0 && parentsResponse.users) {
      for (const child of children) {
        const parent = parentsResponse.users.find(p => p.id === child.parentId);
        enrichedChildren.push({
          ...child,
          parentName: parent ? parent.name : 'Unknown',
          parentContact: parent ? parent.contactNumber : 'Unknown'
        });
      }
    }
    
    res.status(200).json({ 
      children: enrichedChildren,
      totalCount: enrichedChildren.length
    });
  } catch (error) {
    console.error('Error fetching students by school:', error);
    res.status(500).json({ message: 'Error fetching students by school', error: error.message });
  }
};

// Delete student (child)
const deleteStudent = async (req, res) => {
  try {
    const { childId } = req.params;
    
    // Check if child exists
    const child = await getChildById(childId);
    if (!child) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Delete child
    await deleteChild(childId);
    
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Error deleting student', error: error.message });
  }
};

// Delete driver
const deleteDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    
    // Check if driver exists
    const driver = await getDriverById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    // Delete driver (uses the admin controller function)
    await deleteUserByIdAdmin({ params: { userId: driverId } }, { json: () => {} });
    
    res.status(200).json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({ message: 'Error deleting driver', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllDriversWithDetails,
  getAllStudents,
  getStudentsBySchool,
  deleteStudent,
  deleteDriver
}; 