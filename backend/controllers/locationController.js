const locationModel = require('../models/locationModel');

// Create new location record
exports.createLocationRecord = async (req, res) => {
  try {
    const locationData = req.body;
    const location = await locationModel.createLocationRecord(locationData);
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get latest location by vehicle
exports.getLatestLocationByVehicle = async (req, res) => {
  try {
    const location = await locationModel.getLatestLocationByVehicleId(req.params.vehicleId);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get location history by vehicle
exports.getLocationHistoryByVehicle = async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    const locations = await locationModel.getLocationHistoryByVehicleId(
      req.params.vehicleId,
      startTime ? new Date(startTime) : null,
      endTime ? new Date(endTime) : null
    );
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update vehicle status
exports.updateVehicleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await locationModel.updateVehicleStatus(req.params.vehicleId, status);
    res.json({ message: 'Vehicle status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active vehicles
exports.getActiveVehicles = async (req, res) => {
  try {
    const vehicles = await locationModel.getActiveVehicles();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 