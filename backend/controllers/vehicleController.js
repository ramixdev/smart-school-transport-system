const vehicleModel = require('../models/vehicleModel');

// Create new vehicle
exports.createVehicle = async (req, res) => {
  try {
    const vehicleData = req.body;
    const vehicle = await vehicleModel.createVehicle(vehicleData);
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await vehicleModel.getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const vehicleData = req.body;
    const vehicle = await vehicleModel.updateVehicle(req.params.id, vehicleData);
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    await vehicleModel.deleteVehicle(req.params.id);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vehicles by school
exports.getVehiclesBySchool = async (req, res) => {
  try {
    const vehicles = await vehicleModel.getVehiclesBySchoolId(req.params.schoolId);
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add maintenance record
exports.addMaintenanceRecord = async (req, res) => {
  try {
    const maintenanceData = req.body;
    await vehicleModel.addMaintenanceRecord(req.params.id, maintenanceData);
    res.json({ message: 'Maintenance record added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update vehicle status
exports.updateVehicleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await vehicleModel.updateVehicleStatus(req.params.id, status);
    res.json({ message: 'Vehicle status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleModel.getAllVehicles();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vehicles by status
exports.getVehiclesByStatus = async (req, res) => {
  try {
    const vehicles = await vehicleModel.getVehiclesByStatus(req.params.status);
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 