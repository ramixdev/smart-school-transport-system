const { db } = require('../config/firebase');
const { createError, ErrorCodes } = require('../utils/errors');
const { validateDate } = require('../utils/validation');
const { calculateETAAndDistance } = require('./locationService');
const { createNotification } = require('./notificationService');

// Mark child as absent
const markChildAbsent = async (childId, date, reason = '') => {
  try {
    if (!validateDate(date)) {
      throw createError(ErrorCodes.VALIDATION_ERROR, 'Invalid date format');
    }

    const formattedDate = date.toISOString().split('T')[0];

    // Check if child exists
    const childDoc = await db.collection('children').doc(childId).get();
    if (!childDoc.exists) {
      throw createError(ErrorCodes.NOT_FOUND, 'Child not found');
    }

    // Check if already marked absent
    const existingAbsence = await db.collection('absences')
      .where('childId', '==', childId)
      .where('date', '==', formattedDate)
      .get();

    if (!existingAbsence.empty) {
      throw createError(ErrorCodes.DUPLICATE_ENTRY, 'Child is already marked absent for this date');
    }

    // Create absence record
    const absenceRef = await db.collection('absences').add({
      childId,
      date: formattedDate,
      reason,
      createdAt: new Date()
    });

    // Get driver's journey for the day if exists
    const journeySnapshot = await db.collection('journeys')
      .where('date', '>=', new Date(formattedDate))
      .where('date', '<', new Date(new Date(formattedDate).setDate(new Date(formattedDate).getDate() + 1)))
      .where('children', 'array-contains', { id: childId })
      .get();

    // Update journey if it exists and hasn't started
    for (const doc of journeySnapshot.docs) {
      const journey = doc.data();
      if (journey.status === 'scheduled') {
        // Remove child from journey
        const updatedChildren = journey.children.filter(c => c.id !== childId);
        await doc.ref.update({
          children: updatedChildren
        });

        // Regenerate route if needed
        if (journey.route) {
          const updatedRoute = await regenerateRoute(doc.id, childId);
          await doc.ref.update({
            route: updatedRoute
          });
          // Notify parents if ETA is earlier
          await notifyParentsOfEarlyArrival(journey, updatedRoute);
        }
      }
    }

    return { id: absenceRef.id, date: formattedDate };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error marking child absent: ${error.message}`);
  }
};

// Cancel child absence
const cancelAbsence = async (childId, date) => {
  try {
    if (!validateDate(date)) {
      throw createError(ErrorCodes.VALIDATION_ERROR, 'Invalid date format');
    }

    const formattedDate = date.toISOString().split('T')[0];

    // Find and delete absence record
    const absenceSnapshot = await db.collection('absences')
      .where('childId', '==', childId)
      .where('date', '==', formattedDate)
      .get();

    if (absenceSnapshot.empty) {
      throw createError(ErrorCodes.NOT_FOUND, 'Absence record not found');
    }

    await absenceSnapshot.docs[0].ref.delete();

    // Get child's driver
    const childDoc = await db.collection('children').doc(childId).get();
    if (!childDoc.exists) {
      throw createError(ErrorCodes.NOT_FOUND, 'Child not found');
    }

    const driverId = childDoc.data().driver;
    if (driverId) {
      // Get driver's journey for the day if exists
      const journeySnapshot = await db.collection('journeys')
        .where('driverId', '==', driverId)
        .where('date', '>=', new Date(formattedDate))
        .where('date', '<', new Date(new Date(formattedDate).setDate(new Date(formattedDate).getDate() + 1)))
        .get();

      // Update journey if it exists and hasn't started
      for (const doc of journeySnapshot.docs) {
        const journey = doc.data();
        if (journey.status === 'scheduled') {
          // Add child back to journey
          const updatedChildren = [...journey.children, {
            id: childId,
            name: childDoc.data().name,
            status: 'pending'
          }];
          await doc.ref.update({
            children: updatedChildren
          });

          // Regenerate route if needed
          if (journey.route) {
            const updatedRoute = await regenerateRoute(doc.id);
            await doc.ref.update({
              route: updatedRoute
            });
          }
        }
      }
    }

    return { success: true };
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error canceling absence: ${error.message}`);
  }
};

// Get child's absences
const getChildAbsences = async (childId, startDate, endDate) => {
  try {
    if (!validateDate(startDate) || !validateDate(endDate)) {
      throw createError(ErrorCodes.VALIDATION_ERROR, 'Invalid date format');
    }

    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];

    const snapshot = await db.collection('absences')
      .where('childId', '==', childId)
      .where('date', '>=', formattedStartDate)
      .where('date', '<=', formattedEndDate)
      .orderBy('date', 'desc')
      .get();

    const absences = [];
    snapshot.forEach(doc => {
      absences.push({ id: doc.id, ...doc.data() });
    });

    return absences;
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error getting child absences: ${error.message}`);
  }
};

// Get absences by date
const getAbsencesByDate = async (date) => {
  try {
    if (!validateDate(date)) {
      throw createError(ErrorCodes.VALIDATION_ERROR, 'Invalid date format');
    }

    const formattedDate = date.toISOString().split('T')[0];

    const snapshot = await db.collection('absences')
      .where('date', '==', formattedDate)
      .get();

    const absences = [];
    for (const doc of snapshot.docs) {
      const absence = { id: doc.id, ...doc.data() };
      // Get child details
      const childDoc = await db.collection('children').doc(absence.childId).get();
      if (childDoc.exists) {
        absence.child = { id: childDoc.id, ...childDoc.data() };
      }
      absences.push(absence);
    }

    return absences;
  } catch (error) {
    throw createError(ErrorCodes.DATABASE_ERROR, `Error getting absences by date: ${error.message}`);
  }
};

// Helper: Get baseline ETAs for each child (could be stored or calculated once)
async function getBaselineETAs(journey) {
  // For simplicity, assume baseline ETAs are stored in journey.baselineEtas
  // If not, calculate using the original route before absence
  return journey.baselineEtas || {};
}

// Helper: Notify parents if ETA is earlier by threshold
async function notifyParentsOfEarlyArrival(journey, updatedRoute, thresholdMinutes = 10) {
  const baselineEtas = await getBaselineETAs(journey);
  for (const stop of updatedRoute.stops) {
    if (stop.childId && stop.type === 'pickup') {
      // Calculate new ETA
      const etaResult = await calculateETAAndDistance(journey.driverId, stop.location);
      const newEta = etaResult.eta;
      const baselineEta = baselineEtas[stop.childId];
      if (baselineEta && baselineEta - newEta >= thresholdMinutes) {
        // Send notification to parent
        const childDoc = await db.collection('children').doc(stop.childId).get();
        const parentId = childDoc.data().parentId;
        await createNotification(
          parentId,
          'early_arrival',
          `The driver will arrive at your location approximately ${baselineEta - newEta} minutes earlier today due to route changes.`,
          { childId: stop.childId, newEta, baselineEta }
        );
      }
    }
  }
}

module.exports = {
  markChildAbsent,
  cancelAbsence,
  getChildAbsences,
  getAbsencesByDate
}; 