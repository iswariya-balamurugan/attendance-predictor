/**
 * Attendance Calculation and Prediction Engine
 * Built strictly on top of STP2 timetableService.
 *
 * Implements:
 * - Classes conducted so far (from semester start 2026-08-29 to currentDate)
 * - Estimated attended classes
 * - Classes remaining (from tomorrow to semester end 2026-11-29)
 * - Maximum possible attendance
 * - Minimum required classes for 75% and 90%
 * - Attendance status (90% ACHIEVED, SAFE, DETENTION RISK, IRREVERSIBLE DETENTION)
 * - Future attendance projections (missable classes vs must attend)
 * - Comprehensive semester-end forecast
 */

const timetableService = require('./timetableService');

const SEMESTER_START = '2026-08-29';
const SEMESTER_END = '2026-11-29';

/**
 * Validates attendance percentage input (0 to 100)
 */
function validateAttendancePercentage(percentage) {
  if (typeof percentage !== 'number' || isNaN(percentage)) {
    throw new Error(`Invalid attendance percentage: "${percentage}". Expected a number between 0 and 100.`);
  }
  if (percentage < 0 || percentage > 100) {
    throw new Error(`Attendance percentage must be between 0 and 100. Received: ${percentage}`);
  }
}

/**
 * Validates and resolves subject in section
 */
function resolveSubject(sectionName, subjectIdentifier) {
  const subjects = timetableService.getSubjectsForSection(sectionName);
  const normalized = (subjectIdentifier || '').trim().toLowerCase();
  
  const found = subjects.find(
    s => s.subjectCode.toLowerCase() === normalized ||
         s.subjectName.toLowerCase() === normalized
  );

  if (!found) {
    throw new Error(`Subject "${subjectIdentifier}" not found in section "${sectionName}".`);
  }

  return found;
}

/**
 * Estimates attended classes from conducted classes and percentage.
 * Centralized formula: A = Math.round(T * P / 100), bounded by [0, T].
 */
function estimateAttendedClasses(classesConducted, attendancePercentage) {
  validateAttendancePercentage(attendancePercentage);
  if (classesConducted <= 0) return 0;
  const attended = Math.round((classesConducted * attendancePercentage) / 100);
  return Math.min(classesConducted, Math.max(0, attended));
}

/**
 * Computes the next calendar date as YYYY-MM-DD
 */
function getNextDay(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Calculates scheduled classes conducted up to currentDate (inclusive)
 */
function getClassesConducted(sectionName, subjectCode, currentDate) {
  if (currentDate < SEMESTER_START) {
    return 0;
  }
  const effectiveEnd = currentDate > SEMESTER_END ? SEMESTER_END : currentDate;
  const result = timetableService.getClassOccurrencesBetweenDates(
    sectionName,
    SEMESTER_START,
    effectiveEnd,
    subjectCode
  );
  return result.totalOccurrences;
}

/**
 * Calculates scheduled classes remaining after currentDate (from tomorrow to semester end)
 */
function getClassesRemaining(sectionName, subjectCode, currentDate) {
  if (currentDate >= SEMESTER_END) {
    return 0;
  }
  
  let effectiveStart;
  if (currentDate < SEMESTER_START) {
    effectiveStart = SEMESTER_START;
  } else {
    effectiveStart = getNextDay(currentDate);
  }

  if (effectiveStart > SEMESTER_END) {
    return 0;
  }

  const result = timetableService.getClassOccurrencesBetweenDates(
    sectionName,
    effectiveStart,
    SEMESTER_END,
    subjectCode
  );
  return result.totalOccurrences;
}

/**
 * Calculates maximum possible attendance percentage if student attends all remaining classes
 */
function calculateMaximumPossibleAttendance(attendedClasses, classesConducted, classesRemaining) {
  const totalClasses = classesConducted + classesRemaining;
  if (totalClasses === 0) {
    return 100.0;
  }
  const maxAttended = attendedClasses + classesRemaining;
  const percentage = (maxAttended / totalClasses) * 100;
  return Number(percentage.toFixed(2));
}

/**
 * Calculates minimum remaining classes required to reach a target percentage (e.g. 75 or 90)
 *
 * Formula:
 * (A + x) / (T + R) >= target / 100
 * => x >= (target * (T + R) / 100) - A
 *
 * Rules:
 * - If current attendance >= target, returns 0.
 * - If required > remaining, target is impossible.
 * - Never returns a negative value.
 */
function calculateRequiredClasses(attendedClasses, classesConducted, classesRemaining, currentAttendance, targetPercentage) {
  // If current attendance is already >= target percentage, return 0
  if (currentAttendance >= targetPercentage) {
    return {
      required: 0,
      achievable: true
    };
  }

  const totalClasses = classesConducted + classesRemaining;
  if (totalClasses === 0) {
    return {
      required: 0,
      achievable: true
    };
  }

  // Exact target count needed at semester end
  const targetNeeded = (targetPercentage * totalClasses) / 100;
  const rawDiff = targetNeeded - attendedClasses;
  const x = Math.max(0, Math.ceil(rawDiff - 1e-9));

  if (x > classesRemaining) {
    return {
      required: x,
      achievable: false
    };
  }

  return {
    required: x,
    achievable: true
  };
}

/**
 * Determines attendance status based on current attendance and maximum possible attendance
 */
function determineAttendanceStatus(currentAttendance, maxPossibleAttendance) {
  if (currentAttendance >= 90) {
    return '90% ACHIEVED';
  } else if (currentAttendance >= 75) {
    return 'SAFE';
  } else if (maxPossibleAttendance >= 75) {
    return 'DETENTION RISK';
  } else {
    return 'IRREVERSIBLE DETENTION';
  }
}

/**
 * Step 9: Generates the complete Semester-End Forecast for a section and subject
 */
function getSemesterEndForecast(sectionName, subjectIdentifier, currentAttendance, currentDate) {
  validateAttendancePercentage(currentAttendance);
  const subject = resolveSubject(sectionName, subjectIdentifier);
  const subjectCode = subject.subjectCode;

  const classesConducted = getClassesConducted(sectionName, subjectCode, currentDate);
  const classesRemaining = getClassesRemaining(sectionName, subjectCode, currentDate);
  const totalClasses = classesConducted + classesRemaining;
  const attendedClasses = estimateAttendedClasses(classesConducted, currentAttendance);

  const maxPossible = calculateMaximumPossibleAttendance(attendedClasses, classesConducted, classesRemaining);

  const req75 = calculateRequiredClasses(attendedClasses, classesConducted, classesRemaining, currentAttendance, 75);
  const req90 = calculateRequiredClasses(attendedClasses, classesConducted, classesRemaining, currentAttendance, 90);

  const status = determineAttendanceStatus(currentAttendance, maxPossible);

  return {
    section: sectionName,
    subjectCode: subject.subjectCode,
    subjectName: subject.subjectName,
    faculty: subject.faculty,
    credits: subject.credits,
    classType: subject.classType,
    currentDate: currentDate,
    currentAttendance: Number(currentAttendance.toFixed(2)),
    classesConducted,
    estimatedAttendedClasses: attendedClasses,
    classesRemaining,
    totalClasses,
    maximumPossibleAttendance: maxPossible,
    requiredFor75: req75.achievable ? req75.required : null,
    requiredFor90: req90.achievable ? req90.required : null,
    canReach75: req75.achievable,
    canReach90: req90.achievable,
    status
  };
}

/**
 * Step 8: Future Attendance Projection
 * Evaluates missable classes vs must-attend classes to maintain >=75%
 */
function getFutureProjection(sectionName, subjectIdentifier, currentAttendance, planningDate) {
  validateAttendancePercentage(currentAttendance);
  const subject = resolveSubject(sectionName, subjectIdentifier);
  const subjectCode = subject.subjectCode;

  const classesConducted = getClassesConducted(sectionName, subjectCode, planningDate);
  const classesRemaining = getClassesRemaining(sectionName, subjectCode, planningDate);
  const totalClasses = classesConducted + classesRemaining;
  const attendedClasses = estimateAttendedClasses(classesConducted, currentAttendance);

  const maxPossible = calculateMaximumPossibleAttendance(attendedClasses, classesConducted, classesRemaining);

  // Condition to maintain >= 75%: (A + (R - m)) / (T + R) >= 0.75
  const targetAttendanceCount = Math.ceil(((75 * totalClasses) / 100) - 1e-9);

  let mustAttend = 0;
  let canMiss = 0;
  let canMaintain75 = false;

  if (totalClasses === 0) {
    canMaintain75 = true;
    mustAttend = 0;
    canMiss = 0;
  } else if (maxPossible < 75) {
    // Impossible to reach/maintain 75%
    canMaintain75 = false;
    mustAttend = classesRemaining;
    canMiss = 0;
  } else {
    canMaintain75 = true;
    // Minimum classes to attend out of R:
    // A + mustAttend >= targetAttendanceCount
    const needed = targetAttendanceCount - attendedClasses;
    mustAttend = Math.max(0, Math.min(classesRemaining, needed));
    canMiss = classesRemaining - mustAttend;
  }

  const projectedIfAllAttended = maxPossible;
  const projectedIfMaxMissed = totalClasses > 0
    ? Number((((attendedClasses + (classesRemaining - canMiss)) / totalClasses) * 100).toFixed(2))
    : 100.0;

  return {
    section: sectionName,
    subjectCode: subject.subjectCode,
    subjectName: subject.subjectName,
    planningDate: planningDate,
    currentAttendance: Number(currentAttendance.toFixed(2)),
    classesConducted,
    estimatedAttendedClasses: attendedClasses,
    totalUpcomingClasses: classesRemaining,
    totalSemesterClasses: totalClasses,
    targetPercentage: 75,
    canMaintain75,
    mustAttend,
    canMiss,
    projectedAttendanceIfAllAttended: projectedIfAllAttended,
    projectedAttendanceIfMaxMissed: projectedIfMaxMissed
  };
}

module.exports = {
  SEMESTER_START,
  SEMESTER_END,
  validateAttendancePercentage,
  resolveSubject,
  estimateAttendedClasses,
  getClassesConducted,
  getClassesRemaining,
  calculateMaximumPossibleAttendance,
  calculateRequiredClasses,
  determineAttendanceStatus,
  getSemesterEndForecast,
  getFutureProjection
};
