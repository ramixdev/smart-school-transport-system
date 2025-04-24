const { 
  createSchool, 
  getSchoolById, 
  updateSchool, 
  deleteSchool, 
  getAllSchools 
} = require('../models/schoolModel');

// Get all schools
const getAllSchoolsList = async (req, res) => {
  try {
    const schools = await getAllSchools();
    res.status(200).json({ schools });
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ message: 'Error fetching schools', error: error.message });
  }
};

// Get school by ID
const getSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    const school = await getSchoolById(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    
    res.status(200).json({ school });
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({ message: 'Error fetching school', error: error.message });
  }
};

// Create new school (admin only)
const addSchool = async (req, res) => {
  try {
    const { name, address, location } = req.body;
    
    // Create school record
    const schoolData = {
      name,
      address,
      location: location || null,
      createdAt: new Date()
    };
    
    const school = await createSchool(schoolData);
    
    res.status(201).json({ message: 'School added successfully', school });
  } catch (error) {
    console.error('Error adding school:', error);
    res.status(500).json({ message: 'Error adding school', error: error.message });
  }
};

// Update school (admin only)
const updateSchoolDetails = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { name, address, location } = req.body;
    
    // Check if school exists
    const school = await getSchoolById(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    
    // Update school data
    const updatedData = {
      ...(name && { name }),
      ...(address && { address }),
      ...(location && { location }),
      updatedAt: new Date()
    };
    
    const updatedSchool = await updateSchool(schoolId, updatedData);
    
    res.status(200).json({ message: 'School updated successfully', school: updatedSchool });
  } catch (error) {
    console.error('Error updating school:', error);
    res.status(500).json({ message: 'Error updating school', error: error.message });
  }
};

// Delete school (admin only)
const removeSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    // Check if school exists
    const school = await getSchoolById(schoolId);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    
    // Delete school
    await deleteSchool(schoolId);
    
    res.status(200).json({ message: 'School deleted successfully' });
  } catch (error) {
    console.error('Error deleting school:', error);
    res.status(500).json({ message: 'Error deleting school', error: error.message });
  }
};

module.exports = {
  getAllSchoolsList,
  getSchool,
  addSchool,
  updateSchoolDetails,
  removeSchool
}; 