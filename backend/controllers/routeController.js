const routeModel = require('../models/routeModel');

// Create new route
exports.createRoute = async (req, res) => {
  try {
    const routeData = req.body;
    const route = await routeModel.createRoute(routeData);
    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get route by ID
exports.getRouteById = async (req, res) => {
  try {
    const route = await routeModel.getRouteById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update route
exports.updateRoute = async (req, res) => {
  try {
    const routeData = req.body;
    const route = await routeModel.updateRoute(req.params.id, routeData);
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete route
exports.deleteRoute = async (req, res) => {
  try {
    await routeModel.deleteRoute(req.params.id);
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get routes by school
exports.getRoutesBySchool = async (req, res) => {
  try {
    const routes = await routeModel.getRoutesBySchoolId(req.params.schoolId);
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get routes by driver
exports.getRoutesByDriver = async (req, res) => {
  try {
    const routes = await routeModel.getRoutesByDriverId(req.params.driverId);
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add stop to route
exports.addStopToRoute = async (req, res) => {
  try {
    const stopData = req.body;
    await routeModel.addStopToRoute(req.params.id, stopData);
    res.json({ message: 'Stop added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove stop from route
exports.removeStopFromRoute = async (req, res) => {
  try {
    await routeModel.removeStopFromRoute(req.params.routeId, req.params.stopId);
    res.json({ message: 'Stop removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update route schedule
exports.updateRouteSchedule = async (req, res) => {
  try {
    const scheduleData = req.body;
    await routeModel.updateRouteSchedule(req.params.id, scheduleData);
    res.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 