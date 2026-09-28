/**
 * Future Attendance Planning & Semester Forecast Service
 * Built on top of STP2 timetableService and STP3 attendanceEngine.
 *
 * Implements:
 * - Upcoming class breakdown between any two dates
 * - Planning date validation (within 2026-08-29 to 2026-11-29)
 * - 75% future planning calculation (canMiss vs mustAttend for a planning date)
 * - Semester-end forecast with maximum allowable skips
 */

const timetableService = require('./timetableService');
const attendanceEngine = require('./attendanceEngine');

const SEMESTER_START = attendanceEngine.SEMESTER_START; // '2026-08-29'
const SEMESTER_END = attendanceEngine.SEMESTER_END;     // '2026-11-29'

/**
 * Validates planning date against semester boundaries
 */
function validatePlanningDate(planningDate, currentDate = null) {
  if (!planningDate || typeof planningDate !== 'string') {
    throw new Error(`Invalid planning date: "${planningDate}". Expected a string in YYYY-MM-DD format.`);
  }

  const pDate = new Date(planningDate);
  if (isNaN(pDate.getTime())) {
    throw new Error(`Invalid planning date format: "${planningDate}". Expected YYYY-MM-DD.`);
  }

  if (planningDate < SEMESTER_START) {
    throw new Error(`Planning date (${planningDate}) cannot be before semester start date (${SEMESTER_START}).`);
  }

  if (planningDate > SEMESTER_END) {
    throw new Error(`Planning date (${planningDate}) cannot be after semester end date (${SEMESTER_END}).`);
  }

  if (currentDate && planningDate < currentDate) {
    throw new Error(`Planning date (${planningDate}) cannot be before current date (${currentDate}).`);
  }

  return true;
}

/**
 * Returns scheduled upcoming classes between startDate and endDate (inclusive)
 * Formatted for UI consumption and attendance calculations.
 */
function getUpcomingClasses(sectionName, startDate, endDate, subjectCodeFilter = null) {
  const result = timetableService.getClassOccurrencesBetweenDates(
    sectionName,
    startDate,
    endDate,
    subjectCodeFilter
  );

  return result.occurrences.map(item => ({
    date: item.date,
    day: item.day,
    period: item.period,
    startTime: item.startTime,
    endTime: item.endTime,
    subject: item.subjectName,
    subjectCode: item.subjectCode,
    classType: item.classType,
    slot: item.slot,
    section: item.section
  }));
}

/**
 * Computes the day after a given date string (YYYY-MM-DD)
 */
function getDayAfter(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Core STP4 Planning Calculation:
 * "If I plan until planningDate, how many upcoming classes can I miss while keeping attendance >= 75%?"
 *
 * Can be called with positional arguments:
 * (sectionName, subjectIdentifier, currentAttendance, planningDate, currentDate)
 * Or with a config object:
 * { sectionName, subjectIdentifier, currentAttendance, planningDate, currentDate }
 */
function calculateFutureAttendancePlan(arg1, arg2, arg3, arg4, arg5) {
  let sectionName, subjectIdentifier, currentAttendance, planningDate, currentDate;

  if (typeof arg1 === 'object' && arg1 !== null) {
    sectionName = arg1.sectionName || arg1.section;
    subjectIdentifier = arg1.subjectIdentifier || arg1.subject || arg1.subjectCode;
    currentAttendance = arg1.currentAttendance;
    planningDate = arg1.planningDate;
    currentDate = arg1.currentDate || '2026-09-28';
  } else {
    sectionName = arg1;
    subjectIdentifier = arg2;
    currentAttendance = arg3;
    planningDate = arg4;
    currentDate = arg5 || '2026-09-28';
  }

  // 1. Validations
  attendanceEngine.validateAttendancePercentage(currentAttendance);
  validatePlanningDate(planningDate, currentDate);

  const subject = attendanceEngine.resolveSubject(sectionName, subjectIdentifier);
  const subjectCode = subject.subjectCode;

  // 2. Classes Conducted so far (from SEMESTER_START to currentDate)
  const classesConducted = attendanceEngine.getClassesConducted(sectionName, subjectCode, currentDate);
  const estimatedAttended = attendanceEngine.estimateAttendedClasses(classesConducted, currentAttendance);

  // 3. Upcoming Scheduled Classes (from currentDate + 1 through planningDate)
  let upcomingClasses = [];
  let upcomingStart;

  if (currentDate < SEMESTER_START) {
    upcomingStart = SEMESTER_START;
  } else {
    upcomingStart = getDayAfter(currentDate);
  }

  if (upcomingStart <= planningDate) {
    upcomingClasses = getUpcomingClasses(sectionName, upcomingStart, planningDate, subjectCode);
  }

  const totalUpcomingClasses = upcomingClasses.length;
  const totalClasses = classesConducted + totalUpcomingClasses;

  // 4. 75% Planning Calculation
  // Target: (A + (R - m)) / (T + R) >= 0.75
  const maxPossible = totalClasses > 0
    ? Number((((estimatedAttended + totalUpcomingClasses) / totalClasses) * 100).toFixed(2))
    : 100.0;

  const targetPercentage = 75;
  const targetThreshold = (targetPercentage * totalClasses) / 100;

  let canReach75 = false;
  let canMiss = 0;
  let mustAttend = 0;
  let projectedAttendance = 0;

  if (totalClasses === 0) {
    canReach75 = true;
    canMiss = 0;
    mustAttend = 0;
    projectedAttendance = 100.0;
  } else if (maxPossible < 75.0) {
    // 75% is impossible even if attending every upcoming class
    canReach75 = false;
    canMiss = 0;
    mustAttend = totalUpcomingClasses;
    projectedAttendance = maxPossible;
  } else {
    canReach75 = true;
    // Largest integer m satisfying: estimatedAttended + (totalUpcomingClasses - m) >= targetThreshold
    // => m <= (estimatedAttended + totalUpcomingClasses) - targetThreshold
    const maxMissFloat = (estimatedAttended + totalUpcomingClasses) - targetThreshold;
    const m = Math.floor(maxMissFloat + 1e-9);
    
    canMiss = Math.max(0, Math.min(totalUpcomingClasses, m));
    mustAttend = totalUpcomingClasses - canMiss;

    const finalAttended = estimatedAttended + mustAttend;
    projectedAttendance = Number(((finalAttended / totalClasses) * 100).toFixed(2));
  }

  const status = attendanceEngine.determineAttendanceStatus(currentAttendance, maxPossible);

  return {
    section: sectionName,
    subjectCode: subject.subjectCode,
    subjectName: subject.subjectName,
    faculty: subject.faculty,
    credits: subject.credits,
    classType: subject.classType,
    currentDate,
    planningDate,
    currentAttendance: Number(currentAttendance.toFixed(2)),
    classesConducted,
    estimatedAttendedClasses: estimatedAttended,
    totalUpcomingClasses,
    upcomingClassCount: totalUpcomingClasses,
    upcomingClassDates: Array.from(new Set(upcomingClasses.map(c => c.date))),
    upcomingClasses,
    canReach75,
    mustAttend,
    canMiss,
    projectedAttendance,
    targetPercentage: 75,
    status
  };
}

/**
 * Step 4: Enhanced Semester-End Forecast
 * Evaluates full semester through 2026-11-29 including maximum allowable misses.
 */
function getSemesterEndForecast(sectionName, subjectIdentifier, currentAttendance, currentDate = '2026-09-28') {
  // Leverage existing STP3 forecast
  const baseForecast = attendanceEngine.getSemesterEndForecast(
    sectionName,
    subjectIdentifier,
    currentAttendance,
    currentDate
  );

  // Compute maximum allowable skips across entire remaining semester for 75%
  const totalClasses = baseForecast.totalClasses;
  const attended = baseForecast.estimatedAttendedClasses;
  const remaining = baseForecast.classesRemaining;

  let maxMissableFor75 = 0;
  if (baseForecast.canReach75 && totalClasses > 0) {
    const targetThreshold = (75 * totalClasses) / 100;
    const maxMissFloat = (attended + remaining) - targetThreshold;
    maxMissableFor75 = Math.max(0, Math.min(remaining, Math.floor(maxMissFloat + 1e-9)));
  }

  return {
    section: baseForecast.section,
    subjectCode: baseForecast.subjectCode,
    subjectName: baseForecast.subjectName,
    faculty: baseForecast.faculty,
    credits: baseForecast.credits,
    classType: baseForecast.classType,
    currentDate: baseForecast.currentDate,
    semesterEndDate: SEMESTER_END,
    currentAttendance: baseForecast.currentAttendance,
    classesConducted: baseForecast.classesConducted,
    classesRemaining: baseForecast.classesRemaining,
    totalClasses: baseForecast.totalClasses,
    maximumPossibleAttendance: baseForecast.maximumPossibleAttendance,
    canReach75: baseForecast.canReach75,
    requiredFor75: baseForecast.requiredFor75,
    canReach90: baseForecast.canReach90,
    requiredFor90: baseForecast.requiredFor90,
    maxMissableFor75,
    maximumClassesCanBeMissedFor75: maxMissableFor75,
    status: baseForecast.status,
    finalStatus: baseForecast.status
  };
}

module.exports = {
  SEMESTER_START,
  SEMESTER_END,
  validatePlanningDate,
  getUpcomingClasses,
  calculateFutureAttendancePlan,
  getSemesterEndForecast
};
