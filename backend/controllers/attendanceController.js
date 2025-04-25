const attendanceModel = require('../models/attendanceModel');

// Mark student attendance
exports.markAttendance = async (req, res) => {
  try {
    const { childId, status, type, timestamp, location } = req.body;
    const attendance = await attendanceModel.create({
      childId,
      status,
      type, // 'pickup' or 'dropoff'
      timestamp: timestamp || new Date(),
      location
    });
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance by child
exports.getAttendanceByChild = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const attendance = await attendanceModel.find({
      childId: req.params.childId,
      timestamp: {
        $gte: startDate ? new Date(startDate) : new Date(0),
        $lte: endDate ? new Date(endDate) : new Date()
      }
    }).sort({ timestamp: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance by route
exports.getAttendanceByRoute = async (req, res) => {
  try {
    const { date } = req.query;
    const attendance = await attendanceModel.getAttendanceByRoute(
      req.params.routeId,
      date ? new Date(date) : new Date()
    );
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update attendance record
exports.updateAttendance = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const attendance = await attendanceModel.findByIdAndUpdate(
      req.params.attendanceId,
      { status, notes },
      { new: true }
    );
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get daily attendance report
exports.getDailyAttendanceReport = async (req, res) => {
  try {
    const { schoolId, date } = req.query;
    const report = await attendanceModel.getDailyReport(
      schoolId,
      date ? new Date(date) : new Date()
    );
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 